
using ASPNETCoreAngularDemo.Models;
using AspNetCoreSignalR.Hubs;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ASPNETCoreAngular2Demo.Controller
{
  [Route("api/[controller]/[action]")]
  public class ChatController : Microsoft.AspNetCore.Mvc.Controller
  {
    [HttpPost]
    public IEnumerable<User> ListFriends()
    {
      return from x in ChatHub.clients
             select new User()
             {
               id = x,
               displayName = x // TODO change this after to a real chosen display name
             };
    }
  }
}
