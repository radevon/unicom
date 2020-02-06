using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using PumpDb;
using System.Reflection;
using System.Globalization;

namespace PumpVisualizer.Controllers
{
    [Authorize]
    public class DetailsController : Controller
    {
        //
        // GET: /Details/

        private VisualDataRepository repo_;
        private Logger loger;

        public DetailsController()
        {
            repo_ = new VisualDataRepository(ConfigurationManager.AppSettings["dbPath"]);
            loger=new Logger();
        }

        
        public ActionResult ViewParameters(int id)
        {
            Marker obj = repo_.GetMarkerById(id);
            if (obj == null)
            {
                return HttpNotFound();
            }
            
            return View(obj);
        }

        

        public JsonResult GetDataBySmallPeriod(string identity, string parameterGraph)
        {
            DateTime end = DateTime.Now;
            double interval = 24; // сутки
            
            try
            {
                interval = Convert.ToDouble(ConfigurationManager.AppSettings["DataVisualInterval"], CultureInfo.GetCultureInfo("en-US").NumberFormat);
            }
            catch (Exception ex)
            {
                LogMessage message = new LogMessage()
                {
                    MessageDate = DateTime.Now,
                    MessageType = "error",
                    MessageText = ex.Message + ex.StackTrace
                };

                loger.LogToFile(message);
                loger.LogToDatabase(message);
                
            }
            
            DateTime start = end.AddHours(-interval);
            IEnumerable<ElectricAndWaterParams> data = repo_.GetPumpParamsByIdentityAndDate(identity, start, end);
            ElectricAndWaterParams last = repo_.GetLastPumpParamsByIdentity(identity);
            EWdata jsonData = new EWdata();
            jsonData.StartDate = start;
            jsonData.EndDate = end;
            IEnumerable<ElectricAndWaterParams> temp=data.OrderByDescending(x => x.RecvDate);
            jsonData.DataTable = temp.ToList();
            jsonData.Last = last;
            PropertyInfo infoprop = (typeof(ElectricAndWaterParams)).GetProperty(parameterGraph);

            jsonData.DataGraph = temp.Select(x => new DataForVisual() { RecvDate = x.RecvDate, Value = infoprop.GetValue(x) == null ? 0 : (double)infoprop.GetValue(x) }).ToList();
            return Json(jsonData, JsonRequestBehavior.AllowGet);
        }

    }
}
