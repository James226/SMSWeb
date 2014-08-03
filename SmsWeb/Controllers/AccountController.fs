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
open Newtonsoft.Json
open SmsWeb.Models

[<CLIMutable>]
type Account = {
    [<XmlElement("reference")>]
    Reference: string
    [<XmlElement("label")>]
    Label: string
    [<XmlElement("address")>]
    Address: string
    [<XmlElement("type")>]
    Type: string
    [<XmlElement("messagesremaining")>]
    MessagesRemaining: string
    [<XmlElement("expireson")>]
    ExpiresOn: string
    [<XmlElement("role")>]
    Role: string
}

[<CLIMutable>]
[<XmlRoot("accounts", Namespace = "http://api.esendex.com/ns/")>]
type Accounts = {
    [<XmlElement("account")>]
    Account : Account[]
}

type AccountDetails = {
    Success: bool
    Accounts: Account[]
}

type AccountController() =
    inherit AsyncWorkflowController()

    let GetBasicHeader(loginDetails) = 
        sprintf "%s:%s" loginDetails.Username loginDetails.Password
        |> System.Text.ASCIIEncoding.ASCII.GetBytes
        |> System.Convert.ToBase64String
        |> (fun s -> "Basic " + s)

    let DeserializeAccounts(src : string) = 
        let accountsSerializer = XmlSerializer(typeof<Accounts>)
        let bytes = System.Text.Encoding.ASCII.GetBytes(src)
        let stream = new MemoryStream(bytes)
        accountsSerializer.Deserialize stream :?> Accounts

    member x.Details() = async {
        if HttpContext.Current.Session.["AuthenticationDetails"] <> null then
            try
                let credentials = HttpContext.Current.Session.["AuthenticationDetails"] :?> LoginCredentials
                let auth = GetBasicHeader credentials
                let! http = Http.AsyncRequestString("http://api.dev.esendex.com/v1.0/accounts", headers = [ Authorization auth ])
                let accounts = 
                    http
                    |> DeserializeAccounts
                    |> (fun accounts -> accounts.Account)

                return JsonResult(Data = { Success = true; Accounts = accounts }, JsonRequestBehavior = JsonRequestBehavior.AllowGet) :> ActionResult
            with
            | :? System.Net.WebException -> return JsonResult(Data = { Success = false; Accounts = [||] }, JsonRequestBehavior = JsonRequestBehavior.AllowGet) :> ActionResult
        else
            return JsonResult(Data = { Success = false; Accounts = [||] }, JsonRequestBehavior = JsonRequestBehavior.AllowGet) :> ActionResult
    }