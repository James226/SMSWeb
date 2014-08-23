namespace SmsWeb.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Web
open System.Web.Mvc
open System.Web.Mvc.Ajax

type HomeController() =
    inherit Controller()

    member this.Index () = 
        this.View()

    [<Authorize>]
    member this.Home() =
        this.View() :> ActionResult