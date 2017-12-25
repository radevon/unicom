using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PumpDb
{
    public class Utilite
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="value">дата+время</param>
        /// <param name="include_time">вскючать ли время</param>
        /// <returns>Строковое представление даты для sqlite</returns>
        public static string ToDateSQLite(DateTime value, bool include_time)
        {
            string format_date = "yyyy-MM-dd HH:mm:ss.fff";
            return (include_time ? value : value.Date).ToString(format_date);
        }



    }

}
