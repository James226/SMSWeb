namespace SmsWeb

open Owin
open Microsoft.AspNet.SignalR

type Startup() =
    member x.Configuration(app: IAppBuilder) =
        app.MapSignalR() |> ignore