using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PumpDb
{
    public class SummaryData
    {
        public int MarkerId { get; set; }
        public string Address { get; set; }
        public string Identity { get; set; }

        public DateTime? RecvDate { get; set; }

        public double? TotalEnergy { get; set; }

        public double? TotalWaterRate { get; set; }

        public double? Presure { get; set; }


    }
}
