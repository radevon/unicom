using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PumpDb
{

    // Параметры станции (электрич счетчика + водяного)
    public class ElectricAndWaterParams
    {
        public int Id { get; set; }
        // идентификатор объекта
        public string Identity { get; set; }
        // энергопотребление 
        public double TotalEnergy { get; set; }
        // ток
        public double Amperage1 { get; set; }

        public double Amperage2 { get; set; }

        public double Amperage3 { get; set; }
        // Напряжение
        public double Voltage1 { get; set; }

        public double Voltage2 { get; set; }

        public double Voltage3 { get; set; }

        // Текущая мощность
        public double CurrentElectricPower { get; set; }

        // Общий расход воды
        public double TotalWaterRate { get; set; }

        // Дата снятия показаний
        public DateTime RecvDate { get; set; }

        // Ошибки
        public string Errors { get; set; }

        // какой та там алярм
        public int? Alarm { get; set; }

        // Отношение расхода воды к электроэнергии
        public double WaterEnergy
        {
            get { return this.TotalWaterRate!= 0 ? this.TotalEnergy / this.TotalWaterRate: 0; }
        }
    }
}
