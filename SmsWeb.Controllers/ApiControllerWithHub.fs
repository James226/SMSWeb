namespace SmsWeb.Controllers

open Microsoft.AspNet.SignalR
open Microsoft.AspNet.SignalR.Hubs
open System.Web.Http

type ApiControllerWithHub<'a when 'a :> IHub>() = 
    inherit ApiController()

    let hub = lazy(GlobalHost.ConnectionManager.GetHubContext<'a>())

    member x.Hub
        with get () = hub.Value