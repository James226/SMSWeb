namespace SmsWeb.Hubs

open Microsoft.FSharp.Collections
open EkonBenefits.FSharp.Dynamic
open SmsWeb.Connections

type ConnectionMode =
    | REST = 0
    | SMPP = 1


type OutboundHub() =
    inherit Microsoft.AspNet.SignalR.Hub()

    let mutable connection : Map<string, IConnection> = Map.ofList([])

    override x.OnDisconnected(stopCalled) =
        connection <- connection.Remove(x.Context.ConnectionId)
        base.OnDisconnected(stopCalled)

    member x.SetMode(mode: ConnectionMode, username, password) : unit =
        match mode with
        | ConnectionMode.REST -> "" |> ignore
        | ConnectionMode.SMPP -> connection <- connection.Add((x.Context.ConnectionId, new SmppConnection(x.Context.ConnectionId, username, password, x.UpdateStatus) :> IConnection))
        | _ -> "" |> ignore

    member x.UpdateStatus(connectionId: string, status) =
        x.Clients.Client(connectionId)?UpdateStatus(status)

    member x.SendMessage(originator: string, recipient: string, message: string) : unit =
        let conn = connection.Item x.Context.ConnectionId        
        let messageId = conn.SendMessage(originator, recipient, message)
        messageId |> ignore
