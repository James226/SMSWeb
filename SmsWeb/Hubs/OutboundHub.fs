namespace SmsWeb.Hubs

open Microsoft.FSharp.Collections
open EkonBenefits.FSharp.Dynamic
open Microsoft.AspNet.SignalR
open System.Web
open SmsWeb.Connections

type ConnectionMode =
    | REST = 0
    | SMPP = 1

[<Authorize>]
type OutboundHub(authService: SmsWeb.Services.IAuthenticationService) =
    inherit Hub()

    let mutable connection : Map<string, IConnection> = Map.ofList([])

    let CreateSMPPConnection(connectionId, credentials, statusUpdate, client) =
        let smppConnection = new SmppConnection(connectionId, credentials, statusUpdate)

        smppConnection.MessageDelivered
        |> Observable.subscribe client?MessageDelivered |> ignore

        connection <- connection.Add((connectionId, smppConnection :> IConnection))

    override x.OnDisconnected(stopCalled) =
        if connection.ContainsKey x.Context.ConnectionId then
            connection.[x.Context.ConnectionId].Dispose();
            connection <- connection.Remove(x.Context.ConnectionId)
        base.OnDisconnected(stopCalled)

    member x.SetMode(mode: ConnectionMode) : unit =
        let credentials: SmsWeb.Models.LoginCredentials = authService.GetCredentials()
        match mode with
        | ConnectionMode.REST -> "" |> ignore
        | ConnectionMode.SMPP -> CreateSMPPConnection(x.Context.ConnectionId, credentials, x.UpdateStatus, x.Clients.Client(x.Context.ConnectionId))
        | _ -> "" |> ignore

    member x.UpdateStatus(connectionId: string, status) =
        x.Clients.Client(connectionId)?UpdateStatus(status)

    member x.SendMessage(originator: string, recipient: string, message: string) : unit =
        let conn = connection.Item x.Context.ConnectionId
        let messageId = conn.SendMessage(originator, recipient, message)
        messageId |> ignore
