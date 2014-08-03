namespace SmsWeb.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Web
open System.Web.Mvc
open System.Web.Mvc.Ajax
open SmsWeb.Models
open FSharp.Data
open FSharp.Data.HttpRequestHeaders
open Newtonsoft.Json
open System.Xml.Serialization
open System.IO

[<CLIMutable>]
type Endpoint = {
    [<XmlElement("phonenumber")>]
    PhoneNumber: string
}

[<CLIMutable>]
[<XmlRoot("messageheader", Namespace = "http://api.esendex.com/ns/")>]
type MessageHeader = {
    [<XmlAttribute("id")>]
    Id: string
    [<XmlElement("reference", IsNullable = true)>]
    Reference: string
    [<XmlElement("status")>]
    Status: string
    [<XmlElement("laststatusat", IsNullable = true)>]
    LastStatusAt: string
    [<XmlElement("submittedat", IsNullable = true)>]
    SubmittedAt: string
    [<XmlElement("receivedat", IsNullable = true)>]
    ReceivedAt: string
    [<XmlElement("type")>]
    Type: string
    [<XmlElement("to")>]
    To: Endpoint
    [<XmlElement("from")>]
    From: Endpoint
    [<XmlElement("summary")>]
    Summary: string
    [<XmlElement("body")>]
    Body: string
    [<XmlElement("direction")>]
    Direction: string
    [<XmlElement("parts")>]
    Parts: string
    [<XmlElement("username", IsNullable = true)>]
    Username: string

}

[<CLIMutable>]
[<XmlRoot("message")>]
type MessageDetails = {
    [<XmlElement("from")>]
    From: string
    [<XmlElement("to")>]
    To: string
    [<XmlElement("body")>]
    Body: string
}

[<CLIMutable>]
[<XmlRoot("messages")>]
type MessageContainer = {
    [<XmlElement("accountreference")>]
    AccountReference: string
    [<XmlElement("message")>]
    Message : MessageDetails
}

[<CLIMutable>]
[<XmlRoot("messageheaders", Namespace = "http://api.esendex.com/ns/")>]
type MessageHeaders = {
    [<XmlElement("messageheader")>]
    MessageHeader: MessageHeader[]
}

type SendController() =
    inherit AsyncWorkflowController()

    let GetBasicHeader(loginDetails: LoginCredentials) = 
        sprintf "%s:%s" loginDetails.Username loginDetails.Password
        |> System.Text.ASCIIEncoding.ASCII.GetBytes
        |> System.Convert.ToBase64String
        |> (fun s -> "Basic " + s)

    let SerializeMessage(messageContainer) = 
        let mcSerializer = XmlSerializer(typeof<MessageContainer>)
        let ms = new System.IO.MemoryStream()
        mcSerializer.Serialize(ms, messageContainer)
        ms.Seek(0L, System.IO.SeekOrigin.Begin) |> ignore 
        let reader = new StreamReader(ms)
        reader.ReadToEnd()

    let SendSerializedMessage(credentials: LoginCredentials, serializedMessage) =
        let mdrSerializer = XmlSerializer(typeof<MessageHeaders>)
        let auth = GetBasicHeader credentials
        let http = Http.RequestStream("http://api.dev.esendex.com/v1.0/messagedispatcher", headers = [ Authorization auth ], body = TextRequest serializedMessage)
        let response = mdrSerializer.Deserialize http.ResponseStream :?> MessageHeaders
        response.MessageHeader.[0].Id

    member this.Index() = 
        if HttpContext.Current.Session.["AuthenticationDetails"] <> null then
            this.View() :> ActionResult
        else
            ContentResult(Content = "<script>window.location.href = '/#/login';</script>") :> ActionResult

    member this.Send(message: SendMessage) = async {        
        try
            let credentials = HttpContext.Current.Session.["AuthenticationDetails"] :?> LoginCredentials
            let id = SendSerializedMessage(credentials, SerializeMessage { AccountReference = message.AccountReference; Message = { To = message.To; From = message.From; Body = message.Body } })
            return ContentResult(Content = id) :> ActionResult
        with
        | :? System.Net.WebException -> return ContentResult(Content = "0") :> ActionResult
    }
        