namespace SmsWeb.Hubs

open EkonBenefits.FSharp.Dynamic

type OutboundHub() =
    inherit Microsoft.AspNet.SignalR.Hub()

    override x.OnConnected() =
        x.Clients.Caller?Go("Test")
        base.OnConnected()

    member x.SendMessage(text: string) : unit =
        text |> ignore