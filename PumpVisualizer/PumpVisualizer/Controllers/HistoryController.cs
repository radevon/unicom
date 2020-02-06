using System.Globalization;
using System.Reflection;
using PumpDb;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace PumpVisualizer.Controllers
{
    [Authorize]
    public class HistoryController : Controller
    {

        private VisualDataRepository repo_;
        private Logger loger;
        //
        // GET: /History/

        public HistoryController()
        {
            repo_ = new VisualDataRepository(ConfigurationManager.AppSettings["dbPath"]);
            loger = new Logger();
        }

        public ActionResult History(int id)
        {
            Marker obj = repo_.GetMarkerById(id);
            if (obj == null)
            {
                return HttpNotFound();
            }
            return View(obj);
        }


        public JsonResult GetByPeriod(string identity, DateTime start_, string parameterGraph = "Amperage1")
        {
            DateTime end=start_.AddHours(1);
            IEnumerable<ElectricAndWaterParams> data = repo_.GetPumpParamsByIdentityAndDate(identity, start_, end);
            EWdata jsonData = new EWdata();
            jsonData.StartDate = start_;
            jsonData.EndDate = end;
            IEnumerable<ElectricAndWaterParams> temp = data.OrderBy(x => x.RecvDate);
            jsonData.DataTable = temp.ToList();
            PropertyInfo infoprop = (typeof(ElectricAndWaterParams)).GetProperty(parameterGraph);
            jsonData.DataGraph = temp.Select(x => new DataForVisual() { RecvDate = x.RecvDate, Value = (double)infoprop.GetValue(x) }).ToList();
            return Json(jsonData, JsonRequestBehavior.AllowGet);
        }

       
    }
}
