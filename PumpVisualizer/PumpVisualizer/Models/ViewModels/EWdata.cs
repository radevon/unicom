using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using PumpDb;

namespace PumpVisualizer
{
    public class EWdata
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public List<ElectricAndWaterParams> DataTable { get; set; }

        public List<DataForVisual> DataGraph { get; set; }

        public EWdata()
        {
            DataTable=new List<ElectricAndWaterParams>();
            DataGraph = new List<DataForVisual>();
        }
    }

    public class DataForVisual
    {
        public DateTime RecvDate { get; set; }
        public double Value { get; set; }
    }
}