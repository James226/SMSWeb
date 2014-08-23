namespace SmsWeb.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Web
open System.Web.Mvc
open System.Web.Mvc.Ajax
open Newtonsoft.Json
open SmsWeb.Models

type LoginController(authService: SmsWeb.Controllers.IAuthenticationService) =
    inherit AsyncWorkflowController()

    member x.Index() = 
        x.View()

    member x.Redirect() =
        ContentResult(Content = "<script>window.location.href = '/#/login';</script>") :> ActionResult

    member x.Auth(credentials: LoginCredentials) = async {
        let! success = authService.Authenticate credentials
        match success with
        | true -> return JsonResult(Data = { Success = true }) :> ActionResult
        | false -> return JsonResult(Data = { Success = false }) :> ActionResult
    }
        