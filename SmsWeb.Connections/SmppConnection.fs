namespace SmsWeb.Connections

open JamaaTech.Smpp.Net.Client
open JamaaTech.Smpp.Net.Lib
open JamaaTech.Smpp.Net.Lib.Protocol
open System.Linq

open SmsWeb.Models
    
type SmsMessage = {
    Originator: string;
    Recipient: string;
    MessageReference: int;
    PartId: int;
    PartCount: int;
    Body: string
}

type SmppConnection(connectionId: string, loginCredentials, status) =
    let smppClient = new SmppClient()
        
    let Init() =
        smppClient.Properties.SystemID <- loginCredentials.Username.Split('@').First()
        smppClient.Properties.Password <- loginCredentials.Password
        smppClient.Properties.Port <- 30134
        smppClient.Properties.Host <- "smppapi-01.dev.lab"
        smppClient.Properties.SystemType <- ""
        smppClient.Properties.DefaultServiceType <- ""

        smppClient.AutoReconnectDelay <- 3000
        smppClient.KeepAliveInterval <- 15000

        smppClient.Start()

        smppClient.ConnectionStateChanged
        |> Observable.subscribe (fun args -> status(connectionId, args.CurrentState.ToString())) |> ignore

    do Init()

    let MapTextMessageToSmsMessage(msg: TextMessage) =
        { Originator = msg.SourceAddress; Recipient = msg.DestinationAddress; MessageReference = msg.SegmentID; PartId = msg.SequenceNumber; PartCount = msg.MessageCount; Body = msg.Text }

    interface IConnection with
        member x.Dispose() =
            smppClient.Dispose()

        member x.SendMessage(originator, recipient, message) =
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
            submitSm.SetMessageText(message, DataCoding.SMSCDefault)

            let response = smppClient.CustomSendPDU(submitSm) :?> SubmitSmResp
            response.MessageID

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