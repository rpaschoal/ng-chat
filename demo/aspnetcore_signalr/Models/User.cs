using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ASPNETCoreAngularDemo.Models
{
  public class User
  {
    public object id { get; set; }
    public string displayName { get; set; }
    public int status { get; set; }
    public string avatar { get; set; }
  }
}
