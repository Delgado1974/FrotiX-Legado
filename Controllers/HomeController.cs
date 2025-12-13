using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FrotiX.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [IgnoreAntiforgeryToken]
    public class HomeController :Controller
    {
        public static List<OrdersDetails> order = new List<OrdersDetails>();

        public IActionResult Index()
        {
            try
            {
                return View();
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "Index" , error);
                return View(); // padronizado
            }
        }

        [Route("DataSource")]
        [HttpGet]
        public IActionResult DataSource()
        {
            try
            {
                var order = OrdersDetails.GetAllRecords();
                return Json(order);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "DataSource" , error);
                return View(); // padronizado
            }
        }

        public IActionResult UrlDatasource([FromBody] Data dm)
        {
            try
            {
                var order = OrdersDetails.GetAllRecords();
                var Data = order.ToList();
                int count = order.Count();
                return dm.requiresCounts
                    ? Json(new
                    {
                        result = Data.Skip(dm.skip).Take(dm.take) ,
                        count = count
                    })
                    : Json(Data);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "UrlDatasource" , error);
                return View(); // padronizado
            }
        }

        public ActionResult CrudUpdate([FromBody] CRUDModel<OrdersDetails> value)
        {
            try
            {
                if (value.action == "update")
                {
                    var ord = value.value;
                    OrdersDetails val = OrdersDetails
                        .GetAllRecords()
                        .Where(or => or.orderid == ord.orderid)
                        .FirstOrDefault();
                    val.orderid = ord.orderid;
                    val.employeeid = ord.employeeid;
                    val.customerid = ord.customerid;
                    val.freight = ord.freight;
                    val.orderdate = ord.orderdate;
                    val.shipcity = ord.shipcity;
                    val.shipcountry = ord.shipcountry;
                }
                else if (value.action == "insert")
                {
                    OrdersDetails.GetAllRecords().Insert(0 , value.value);
                }
                return Json(value.value);
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "CrudUpdate" , error);
                return View(); // padronizado
            }
        }

        public class Data
        {
            public bool requiresCounts
            {
                get; set;
            }
            public int skip
            {
                get; set;
            }
            public int take
            {
                get; set;
            }
        }

        public class CRUDModel<T>
            where T : class
        {
            public string action
            {
                get; set;
            }

            public string table
            {
                get; set;
            }

            public string keyColumn
            {
                get; set;
            }

            public object key
            {
                get; set;
            }

            public T value
            {
                get; set;
            }

            public List<T> added
            {
                get; set;
            }

            public List<T> changed
            {
                get; set;
            }

            public List<T> deleted
            {
                get; set;
            }

            public IDictionary<string , object> @params
            {
                get; set;
            }
        }
    }

    public class OrdersDetails
    {
        public static List<OrdersDetails> order = new List<OrdersDetails>();

        public OrdersDetails()
        {
            try
            {
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "OrdersDetails" , error);
            }
        }

        public OrdersDetails(
            int orderid ,
            string customerid ,
            int employeeid ,
            double freight ,
            bool verified ,
            DateTime orderdate ,
            string shipcity ,
            string shipname ,
            string shipcountry ,
            DateTime shippeddate ,
            string shipaddress
        )
        {
            try
            {
                this.orderid = orderid;
                this.customerid = customerid;
                this.employeeid = employeeid;
                this.freight = freight;
                this.shipcity = shipcity;
                this.verified = verified;
                this.orderdate = orderdate;
                this.shipname = shipname;
                this.shipcountry = shipcountry;
                this.shippeddate = shippeddate;
                this.shipaddress = shipaddress;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "OrdersDetails" , error);
            }
        }

        public static List<OrdersDetails> GetAllRecords()
        {
            try
            {
                if (order.Count() == 0)
                {
                    int code = 10000;
                    for (int i = 1; i < 10; i++)
                    {
                        order.Add(
                            new OrdersDetails(
                                code + 1 ,
                                "ALFKI" ,
                                i + 0 ,
                                2.3 * i ,
                                false ,
                                new DateTime(1991 , 05 , 15) ,
                                "Berlin" ,
                                "Simons bistro" ,
                                "Denmark" ,
                                new DateTime(1996 , 7 , 16) ,
                                "Kirchgasse 6"
                            )
                        );
                        order.Add(
                            new OrdersDetails(
                                code + 2 ,
                                "ANATR" ,
                                i + 2 ,
                                3.3 * i ,
                                true ,
                                new DateTime(1990 , 04 , 04) ,
                                "Madrid" ,
                                "Queen Cozinha" ,
                                "Brazil" ,
                                new DateTime(1996 , 9 , 11) ,
                                "Avda. Azteca 123"
                            )
                        );
                        order.Add(
                            new OrdersDetails(
                                code + 3 ,
                                "ANTON" ,
                                i + 1 ,
                                4.3 * i ,
                                true ,
                                new DateTime(1957 , 11 , 30) ,
                                "Cholchester" ,
                                "Frankenversand" ,
                                "Germany" ,
                                new DateTime(1996 , 10 , 7) ,
                                "Carrera 52 con Ave. Bolívar #65-98 Llano Largo"
                            )
                        );
                        order.Add(
                            new OrdersDetails(
                                code + 4 ,
                                "BLONP" ,
                                i + 3 ,
                                5.3 * i ,
                                false ,
                                new DateTime(1930 , 10 , 22) ,
                                "Marseille" ,
                                "Ernst Handel" ,
                                "Austria" ,
                                new DateTime(1996 , 12 , 30) ,
                                "Magazinweg 7"
                            )
                        );
                        order.Add(
                            new OrdersDetails(
                                code + 5 ,
                                "BOLID" ,
                                i + 4 ,
                                6.3 * i ,
                                true ,
                                new DateTime(1953 , 02 , 18) ,
                                "Tsawassen" ,
                                "Hanari Carnes" ,
                                "Switzerland" ,
                                new DateTime(1997 , 12 , 3) ,
                                "1029 - 12th Ave. S."
                            )
                        );
                        code += 5;
                    }
                }
                return order;
            }
            catch (Exception error)
            {
                Alerta.TratamentoErroComLinha("HomeController.cs" , "GetAllRecords" , error);
                return default(List<OrdersDetails>); // padronizado
            }
        }

        public int? orderid
        {
            get; set;
        }
        public string customerid
        {
            get; set;
        }
        public int? employeeid
        {
            get; set;
        }
        public double? freight
        {
            get; set;
        }
        public string shipcity
        {
            get; set;
        }
        public bool verified
        {
            get; set;
        }
        public DateTime orderdate
        {
            get; set;
        }

        public string shipname
        {
            get; set;
        }

        public string shipcountry
        {
            get; set;
        }

        public DateTime shippeddate
        {
            get; set;
        }
        public string shipaddress
        {
            get; set;
        }
    }
}
