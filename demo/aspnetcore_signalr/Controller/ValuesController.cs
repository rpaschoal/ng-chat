
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace ASPNETCoreAngular2Demo.Controller
{
    [Route("api/[controller]")]
    public class ValuesController : Microsoft.AspNetCore.Mvc.Controller
    {
        // GET: api/values
        [HttpGet]
        public IActionResult Get()
        {
            return new JsonResult(new string[] { "value1", "value2" });
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            return new JsonResult("value");
        }

        // POST api/values
        [HttpPost]
        public IActionResult Post([FromBody]string value)
        {
            return new CreatedAtRouteResult("anyroute", null);
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public IActionResult Put(int id, [FromBody]string value)
        {
            return new OkResult();
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            return new NoContentResult();
        }
    }
}
