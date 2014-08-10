namespace SmsWeb.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.IO
open System.Web
open System.Web.Mvc
open System.Web.Mvc.Ajax
open System.Xml.Serialization
open FSharp.Data
open FSharp.Data.HttpRequestHeaders
open EkonBenefits.FSharp.Dynamic
open Newtonsoft.Json
open Microsoft.AspNet.SignalR
open SmsWeb.Models

type InboxController() =
    inherit AsyncWorkflowController()

    let GetBasicHeader(loginDetails) = 
        sprintf "%s:%s" loginDetails.Username loginDetails.Password
        |> System.Text.ASCIIEncoding.ASCII.GetBytes
        |> System.Convert.ToBase64String
        |> (fun s -> "Basic " + s)

    member x.Index() = 
        x.View()

    member x.Messages() = async {                    
        let credentials = HttpContext.Current.Session.["AuthenticationDetails"] :?> LoginCredentials
        let! http = Http.AsyncRequestStream("http://api.dev.esendex.com/v1.0/inbox/messages", headers = [ Authorization( GetBasicHeader(credentials)) ])
        let mdrSerializer = XmlSerializer(typeof<MessageHeaders>)
        let response = mdrSerializer.Deserialize http.ResponseStream :?> MessageHeaders
        return JsonResult(Data = response.MessageHeader, JsonRequestBehavior = JsonRequestBehavior.AllowGet) :> ActionResult
    }
    


type InboxHub() =
    inherit Hub()

    member x.Send(text) =
        printfn "Message Received: %s" text

type TestController() =
    inherit ApiControllerWithHub<InboxHub>()

    member x.Get() =
        x.Hub.Clients.All?DoStuff()
        "Done2"