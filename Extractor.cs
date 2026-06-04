using System;
using System.Drawing;
using System.Windows.Forms;
using System.IO;

namespace ColorExtractor
{
    class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string htmlPath = Path.Combine(Path.GetTempPath(), "test.html");
                File.WriteAllText(htmlPath, "<html><body style=\"margin:0;padding:0;background-color:#e4edfc\"><video src=\"file:///C:/Users/admin/.gemini/antigravity/scratch/Wallet%20Human%20Polymarket%20ID/public/models/8OV12va1Xpqh0v6B9NYUVnm9EJY.mp4\" autoplay muted></video></body></html>");
                
                using (WebBrowser wb = new WebBrowser())
                {
                    wb.ScrollBarsEnabled = false;
                    wb.ScriptErrorsSuppressed = true;
                    wb.Navigate(htmlPath);
                    
                    while (wb.ReadyState != WebBrowserReadyState.Complete)
                    {
                        Application.DoEvents();
                    }
                    
                    System.Threading.Thread.Sleep(3000);
                    Application.DoEvents();
                    
                    using (Bitmap bmp = new Bitmap(100, 100))
                    {
                        wb.DrawToBitmap(bmp, new Rectangle(0, 0, 100, 100));
                        Color c = bmp.GetPixel(50, 50);
                        Console.WriteLine("COLORHEX:#" + c.R.ToString("X2") + c.G.ToString("X2") + c.B.ToString("X2"));
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
        }
    }
}
