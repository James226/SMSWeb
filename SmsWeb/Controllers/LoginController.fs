namespace SmsWeb.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Web
open System.Web.Mvc
open System.Web.Mvc.Ajax
open FSharp.Data
open FSharp.Data.HttpRequestHeaders
open Newtonsoft.Json

[<CLIMutable>]
type LoginCredentials = {
    Username: string
    Password: string
}

type LoginResult = {
    Success: bool
}

type LoginController() =
    inherit AsyncWorkflowController()

    let GetBasicHeader(loginDetails) = 
        sprintf "%s:%s" loginDetails.Username loginDetails.Password
        |> System.Text.ASCIIEncoding.ASCII.GetBytes
        |> System.Convert.ToBase64String
        |> (fun s -> "Basic " + s)

    member x.Index() = 
        x.View()

    member x.Auth(credentials: LoginCredentials) = async {        
        try
            let auth = GetBasicHeader credentials
            let! html = Http.AsyncRequestString("http://api.dev.esendex.com/v1.0/accounts", headers = [ Authorization auth ])
            HttpContext.Current.Session.["AuthenticationDetails"] <- credentials
            return JsonResult(Data = { Success = true }) :> ActionResult
        with
        | :? System.Net.WebException -> return JsonResult(Data = { Success = false }) :> ActionResult
    }
        