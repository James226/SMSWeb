namespace SmsWeb.Controllers

open System
open System.Collections.Generic
open System.Linq
open System.Web
open System.Web.Mvc
open System.Web.Mvc.Ajax

type LoginController() =
    inherit Controller()

    member this.Home() = 
        this.View()

    member this.Auth() =
        
        this.Json()