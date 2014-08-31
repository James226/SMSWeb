namespace SmsWeb.Connections

open JamaaTech.Smpp.Net.Client
open JamaaTech.Smpp.Net.Lib
open JamaaTech.Smpp.Net.Lib.Protocol
open System.Linq

open SmsWeb.Models

type SmsMessage = {
    MessageId: string;
    Originator: string;
    Recipient: string;
    Status: string;
    MessageReference: int;
    PartId: int;
    PartCount: int;
    Body: string;
}

type SmppConnection(connectionId: string, loginCredentials, status) =
    let smppClient = new SmppClient()
    let mutable nextRef = 0

    let Init() =
        smppClient.Properties.SystemID <- "smppclient1" // loginCredentials.Username.Split('@').First()
        smppClient.Properties.Password <- "password" // loginCredentials.Password
        smppClient.Properties.Port <- 2775 // 30134
        smppClient.Properties.Host <- "localhost"
        smppClient.Properties.SystemType <- ""
        smppClient.Properties.DefaultServiceType <- ""

        smppClient.AutoReconnectDelay <- 3000
        smppClient.KeepAliveInterval <- 15000

        smppClient.Start()

        smppClient.ConnectionStateChanged
        |> Observable.subscribe (fun args -> status(connectionId, args.CurrentState.ToString())) |> ignore

    do Init()

    let ToStatus(status) =
        match status with
        | "REJECTD" -> "Rejected"
        | "DELIVRD" -> "Delivered"
        | "EXPIRED" -> "Expired"
        | "DELETED" -> "Deleted"
        | "UNDELIV" -> "Undeliverable"
        | "ACCEPTD" -> "Accepted"
        | _ -> status

    let MapTextMessageToSmsMessage(msg: TextMessage) =
        let parts = 
            msg.Text.Split(' ')
            |> Seq.map (fun parts -> parts.Split(':'))

        let messageId =
            parts
            |> Seq.find (fun parts -> parts.[0] = "id")
            |> Seq.skip 1
            |> Seq.exactlyOne

        let status =
            parts
            |> Seq.find (fun parts -> parts.[0] = "stat")
            |> Seq.skip 1
            |> Seq.exactlyOne
            |> ToStatus

        { MessageId = messageId; Originator = msg.SourceAddress; Recipient = msg.DestinationAddress; Status = status; MessageReference = msg.SegmentID; PartId = msg.SequenceNumber; PartCount = msg.MessageCount; Body = msg.Text }

    let rec SplitParts source part totalParts ref =
        seq { 
            if Seq.isEmpty source then () else
            let segment = source |> Seq.truncate 153
            let rest = source |> Seq.skip (Seq.length segment)
            yield (Some(Udh(1, 1, ref)), System.String(segment.ToArray()))
            yield! SplitParts rest (part + 1) totalParts ref
        }

    let NumParts(message: string) =
        ((float)message.Length) / 153.0
        |> System.Math.Ceiling

    let GetNextRef() =
        (System.Threading.Interlocked.Increment &nextRef) % 256

    let GetMessageParts(message:string) =
        if message.Length <= 160
            then [(None, message)]
            else List.ofSeq(SplitParts message 1 (NumParts message) (GetNextRef()))

    let SendPart originator recipient part = 
        let submitSm = SubmitSm()
        submitSm.SourceAddress.Address <- originator
        submitSm.DestinationAddress.Address <- recipient
        submitSm.DestinationAddress.Npi <- NumberingPlanIndicator.ISDN
        submitSm.DestinationAddress.Ton <- TypeOfNumber.International
        submitSm.SourceAddress.Npi <- NumberingPlanIndicator.ISDN
        submitSm.SourceAddress.Ton <- TypeOfNumber.International
        submitSm.EsmClass <- EsmClass.Default
        submitSm.RegisteredDelivery <- RegisteredDelivery.DeliveryReceipt
        submitSm.ServiceType <- ""

        match part with
        | (Some udh, message) -> submitSm.SetMessageText(message, DataCoding.SMSCDefault, udh)
        | (None, message) -> submitSm.SetMessageText(message, DataCoding.SMSCDefault)

        let response = smppClient.CustomSendPDU(submitSm) :?> SubmitSmResp
        response.MessageID

    let rec SendParts originator recipient parts : seq<string> =
        seq {
            match parts with
            | h :: t -> yield SendPart originator recipient h; yield! SendParts originator recipient t
            | [] -> ()
        }

    interface IConnection with
        member x.Dispose() =
            smppClient.Dispose()

        member x.SendMessage(originator: string, recipient, message) =
            GetMessageParts message
            |> SendParts originator recipient

        member x.IsConnected() =
            smppClient.ConnectionState = SmppConnectionState.Connected

    member x.MessageSent =
        smppClient.MessageSent
        |> Observable.map(fun args -> args.ShortMessage :?> TextMessage)
        |> Observable.map MapTextMessageToSmsMessage

    member x.MessageDelivered = 
        smppClient.MessageDelivered
        |> Observable.map(fun args -> args.ShortMessage :?> TextMessage)
        |> Observable.map MapTextMessageToSmsMessage

    member x.MessageReceived =
        smppClient.MessageReceived
        |> Observable.map(fun args -> args.ShortMessage :?> TextMessage)
        |> Observable.map MapTextMessageToSmsMessage