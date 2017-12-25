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
            double interval = 1; // 1 час для построения графика
            int interval_table = 30;  // 30 мин для данных
            try
            {
                interval = Convert.ToDouble(ConfigurationManager.AppSettings["DataVisualInterval"], CultureInfo.GetCultureInfo("en-US").NumberFormat);
                interval_table = Convert.ToInt32(ConfigurationManager.AppSettings["DataTableInterval"], CultureInfo.GetCultureInfo("en-US").NumberFormat);
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
                interval = 1;
                interval_table = 30;
            }
            
            DateTime start = end.AddHours(-interval);
            IEnumerable<ElectricAndWaterParams> data = repo_.GetPumpParamsByIdentityAndDate(identity, start, end);
            EWdata jsonData = new EWdata();
            jsonData.StartDate = start;
            jsonData.EndDate = end;
            IEnumerable<ElectricAndWaterParams> temp=data.OrderByDescending(x => x.RecvDate);
            jsonData.DataTable = temp.Where(x=>x.RecvDate>end.AddMinutes(-interval_table)).ToList();
            PropertyInfo infoprop = (typeof(ElectricAndWaterParams)).GetProperty(parameterGraph); 
            jsonData.DataGraph = temp.Select(x=>new DataForVisual(){RecvDate=x.RecvDate,Value=(double)infoprop.GetValue(x)}).ToList();
            return Json(jsonData, JsonRequestBehavior.AllowGet);
        }

    }
}
