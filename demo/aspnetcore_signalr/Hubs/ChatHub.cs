using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AspNetCoreSignalR.Hubs
{
  [HubName("ChatHub")]
  public class ChatHub : Hub
  {
    //This list will store all the connect clients
    public static List<string> clients = new List<string>();

    #region Connection LifeCycle

    public override Task OnConnected()
    {
      if (!clients.Contains(Context.ConnectionId))
      {
        clients.Add(Context.ConnectionId);
      }

      return base.OnConnected();
    }

    public override Task OnDisconnected(bool stopCalled)
    {

      if (clients.Contains(Context.ConnectionId))
      {
        clients.Remove(Context.ConnectionId);
      }

      return base.OnDisconnected(stopCalled);
    }

    #endregion

    public void SendMessage(dynamic message)
    {
      dynamic user = new System.Dynamic.ExpandoObject();

      user.id = Context.ConnectionId;
      user.displayName = "Another SignalR user";

      string sendToId = (string)message.toId;

      Clients.Client(sendToId).notifyOfMessage(user, message);

      //Clients.All.notifyOfMessage(user, message);
    }
  }
}
