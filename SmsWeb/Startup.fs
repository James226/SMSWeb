namespace SmsWeb

open Owin
open Microsoft.AspNet.SignalR

type Startup() =
    member x.Configuration(app: IAppBuilder) =
        let config = HubConfiguration()
        //config.Resolver <- Microsoft.AspNet.SignalR.GlobalHost.DependencyResolver
        app.MapSignalR() |> ignore