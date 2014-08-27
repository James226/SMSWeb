namespace SmsWeb.Connections

type IConnection = 
    inherit System.IDisposable

    abstract member SendMessage : string * string * string -> string
    abstract member IsConnected : unit -> bool