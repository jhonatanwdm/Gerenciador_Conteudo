using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace GerenciadorConteudo
{
    static class ProgramaPrincipal
    {
        [DllImport("shell32.dll", SetLastError = true)]
        public static extern void SetCurrentProcessExplicitAppUserModelID([MarshalAs(UnmanagedType.LPWStr)] string AppID);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        static extern bool SetDllDirectory(string lpPathName);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        static extern IntPtr LoadLibrary(string lpFileName);

        private static Process processoServidor = null;
        private static Process processoTrabalhador = null;

        public static void Log(string msg)
        {
            try
            {
                string pastaArmazenamento = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Armazenamento_Local");
                if (!Directory.Exists(pastaArmazenamento)) Directory.CreateDirectory(pastaArmazenamento);
                string arqLog = Path.Combine(pastaArmazenamento, "Registro_Execucao.log");
                File.AppendAllText(arqLog, string.Format("[{0:yyyy-MM-dd HH:mm:ss.fff}] {1}\r\n", DateTime.Now, msg));
            }
            catch { }
        }

        [STAThread]
        static void Main()
        {
            Application.ThreadException += (s, e) =>
            {
                Log("ThreadException: " + e.Exception.ToString());
            };
            AppDomain.CurrentDomain.UnhandledException += (s, e) =>
            {
                Log("UnhandledException: " + e.ExceptionObject.ToString());
            };

            Log("=== Iniciando Aplicação ===");

            // 1. Define AppUserModelID para manter o ícone oficial do programa na barra de tarefas
            try
            {
                SetCurrentProcessExplicitAppUserModelID("GerenciadorConteudo.Aplicativo.1.0");
            }
            catch { }

            string diretorioBase = AppDomain.CurrentDomain.BaseDirectory;
            Directory.SetCurrentDirectory(diretorioBase);

            // 2. Configura diretório de bibliotecas nativas e pré-carrega WebView2Loader.dll
            string pastaBibNativas = Path.Combine(diretorioBase, @"Infraestrutura_Sistema\Bibliotecas_Nativas");
            if (!Directory.Exists(pastaBibNativas)) Directory.CreateDirectory(pastaBibNativas);

            try
            {
                SetDllDirectory(pastaBibNativas);
            }
            catch { }

            string caminhoLoader = Path.Combine(pastaBibNativas, "WebView2Loader.dll");
            if (File.Exists(caminhoLoader))
            {
                IntPtr hLoader = LoadLibrary(caminhoLoader);
                Log("Pré-carregamento WebView2Loader.dll: " + (hLoader != IntPtr.Zero ? "OK" : "FALHA"));
            }

            // 3. Resolve assemblies embutidos diretamente no próprio executável
            AppDomain.CurrentDomain.AssemblyResolve += (sender, args) =>
            {
                string simpleName = new AssemblyName(args.Name).Name;
                string resName = simpleName + ".dll";

                using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resName))
                {
                    if (stream != null)
                    {
                        byte[] buffer = new byte[stream.Length];
                        stream.Read(buffer, 0, buffer.Length);
                        Log("Assembly carregado do recurso embutido: " + resName);
                        return Assembly.Load(buffer);
                    }
                }

                string caminhoDisco = Path.Combine(pastaBibNativas, resName);
                if (File.Exists(caminhoDisco))
                {
                    Log("Assembly carregado do disco: " + caminhoDisco);
                    return Assembly.LoadFrom(caminhoDisco);
                }

                return null;
            };

            ExecutarAplicativo(diretorioBase);
        }

        [MethodImpl(MethodImplOptions.NoInlining)]
        static void ExecutarAplicativo(string diretorioBase)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            string pastaPerfil = Path.Combine(diretorioBase, @"Armazenamento_Local\Perfil_Aplicativo");
            if (!Directory.Exists(pastaPerfil)) Directory.CreateDirectory(pastaPerfil);

            string pastaRecursos = Path.Combine(diretorioBase, @"Infraestrutura_Sistema\Recursos_Visuais");
            string caminhoIco = Path.Combine(pastaRecursos, "Icone_Padrao.ico");
            string caminhoPng = Path.Combine(pastaRecursos, "Icone_Padrao.png");

            Icon iconeApp = null;
            if (File.Exists(caminhoIco))
            {
                try { iconeApp = new Icon(caminhoIco); } catch { }
            }

            // Inicia serviços Node de forma ultra-rápida (< 1 segundo)
            if (!ServidorOnline("http://localhost:3333/api/sistema/saude"))
            {
                Log("Iniciando serviços Node...");
                IniciarServicosNodeRapido(diretorioBase);
            }
            else
            {
                Log("Serviços Node já estão em execução.");
            }

            // Abre a janela principal nativa com WebView2 e tela de carregamento integrada
            try
            {
                Log("Criando FormJanelaPrincipal...");
                using (FormJanelaPrincipal janela = new FormJanelaPrincipal(
                    "http://localhost:3333",
                    pastaPerfil,
                    iconeApp,
                    caminhoPng,
                    () => EncerrarProcessos()))
                {
                    Log("Iniciando Application.Run...");
                    Application.Run(janela);
                    Log("Application.Run finalizado normalmente.");
                }
            }
            catch (Exception ex)
            {
                Log("ERRO fatal em Application.Run: " + ex.ToString());
                MessageBox.Show("Erro ao abrir aplicação: " + ex.Message, "Gerenciador de Conteúdo", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }

            Log("Encerrando processos na saída...");
            EncerrarProcessos();
        }

        private static void IniciarServicosNodeRapido(string diretorioBase)
        {
            string nodeExe = ObterCaminhoNode();
            string tsxCli = Path.Combine(diretorioBase, @"node_modules\tsx\dist\cli.mjs");
            string scriptServidor = Path.Combine(diretorioBase, @"Aplicativos_Base\Servidor_Api\Codigo_Fonte\Aplicativo_Principal.ts");
            string scriptTrabalhador = Path.Combine(diretorioBase, @"Aplicativos_Base\Trabalhador_Fila\Codigo_Fonte\Processador_Principal.ts");

            if (File.Exists(tsxCli) && File.Exists(scriptServidor))
            {
                processoServidor = IniciarProcessoOculto(nodeExe, string.Format("\"{0}\" \"{1}\"", tsxCli, scriptServidor), diretorioBase);
                processoTrabalhador = IniciarProcessoOculto(nodeExe, string.Format("\"{0}\" \"{1}\"", tsxCli, scriptTrabalhador), diretorioBase);
            }
            else
            {
                processoServidor = IniciarProcessoOculto("cmd.exe", "/c npm.cmd run iniciar:servidor", diretorioBase);
                processoTrabalhador = IniciarProcessoOculto("cmd.exe", "/c npm.cmd run iniciar:trabalhador", diretorioBase);
            }
        }

        private static string ObterCaminhoNode()
        {
            string[] caminhos = new string[]
            {
                @"C:\Program Files\nodejs\node.exe",
                @"C:\Program Files (x86)\nodejs\node.exe",
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"nodejs\node.exe")
            };
            foreach (var c in caminhos)
            {
                if (File.Exists(c)) return c;
            }
            return "node.exe";
        }

        private static Process IniciarProcessoOculto(string executavel, string argumentos, string diretorio)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = executavel,
                    Arguments = argumentos,
                    WorkingDirectory = diretorio,
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };
                return Process.Start(psi);
            }
            catch
            {
                return null;
            }
        }

        public static bool ServidorOnline(string url)
        {
            try
            {
                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(url);
                request.Timeout = 400;
                request.Method = "GET";
                using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
                {
                    return response.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        private static void EncerrarProcessos()
        {
            try
            {
                if (processoServidor != null && !processoServidor.HasExited)
                {
                    MatarArvoreProcesso(processoServidor.Id);
                }
                if (processoTrabalhador != null && !processoTrabalhador.HasExited)
                {
                    MatarArvoreProcesso(processoTrabalhador.Id);
                }

                ProcessStartInfo psiKill = new ProcessStartInfo
                {
                    FileName = "taskkill",
                    Arguments = "/F /IM node.exe /T",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };
                Process.Start(psiKill);
            }
            catch { }
        }

        private static void MatarArvoreProcesso(int pid)
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "taskkill",
                    Arguments = string.Format("/F /T /PID {0}", pid),
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    WindowStyle = ProcessWindowStyle.Hidden
                };
                Process.Start(psi);
            }
            catch { }
        }
    }

    public class FormJanelaPrincipal : Form
    {
        [DllImport("dwmapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private const int DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_20H1 = 19;
        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;
        private const int DWMWA_CAPTION_COLOR = 35;
        private const int DWMWA_TEXT_COLOR = 36;

        private const string NOME_APP = "Gerenciador de Conteúdo";
        private const string VERSAO_APP = "1.0.0";
        private System.Windows.Forms.Timer timerTitulo;
        private DateTime inicioApp = DateTime.Now;

        private WebView2 webView;
        private Panel painelSplash;
        private string urlInicial;
        private string pastaUserData;
        private Action aoFechar;

        public FormJanelaPrincipal(string url, string pastaUserData, Icon icone, string caminhoPng, Action aoFechar)
        {
            this.urlInicial = url;
            this.pastaUserData = pastaUserData;
            this.aoFechar = aoFechar;

            this.Text = ObterTextoTitulo();
            this.Size = new Size(1360, 768);
            this.MinimumSize = new Size(1360, 768);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.BackColor = ColorTranslator.FromHtml("#0B0F17");
            if (icone != null) this.Icon = icone;

            IniciarTituloDinamico();

            // 1. Painel elegante de carregamento centralizado dentro da janela principal
            painelSplash = new Panel
            {
                Size = new Size(400, 160),
                BackColor = ColorTranslator.FromHtml("#111827"),
                Location = new Point((this.ClientSize.Width - 400) / 2, (this.ClientSize.Height - 160) / 2)
            };
            this.Controls.Add(painelSplash);

            if (File.Exists(caminhoPng))
            {
                try
                {
                    PictureBox pic = new PictureBox
                    {
                        Image = Image.FromFile(caminhoPng),
                        SizeMode = PictureBoxSizeMode.Zoom,
                        Location = new Point(24, 22),
                        Size = new Size(40, 40)
                    };
                    painelSplash.Controls.Add(pic);
                }
                catch { }
            }

            Label lblTitulo = new Label
            {
                Text = "Gerenciador de Conteúdo",
                Font = new Font("Segoe UI", 14, FontStyle.Bold),
                ForeColor = Color.White,
                Location = new Point(74, 22),
                AutoSize = true
            };
            painelSplash.Controls.Add(lblTitulo);

            Label lblStatus = new Label
            {
                Text = "Iniciando serviços e banco de dados...",
                Font = new Font("Segoe UI", 9, FontStyle.Regular),
                ForeColor = ColorTranslator.FromHtml("#9CA3AF"),
                Location = new Point(76, 52),
                AutoSize = true
            };
            painelSplash.Controls.Add(lblStatus);

            ProgressBar progresso = new ProgressBar
            {
                Style = ProgressBarStyle.Marquee,
                MarqueeAnimationSpeed = 30,
                Location = new Point(24, 106),
                Size = new Size(352, 6)
            };
            painelSplash.Controls.Add(progresso);

            // 2. Componente WebView2 (inicialmente invisível enquanto aguarda inicialização rápida)
            webView = new WebView2
            {
                Dock = DockStyle.Fill,
                Visible = false,
                DefaultBackgroundColor = ColorTranslator.FromHtml("#0B0F17")
            };
            this.Controls.Add(webView);

            FormWindowState estadoAnterior = this.WindowState;
            this.Resize += (s, e) =>
            {
                if (estadoAnterior == FormWindowState.Maximized && this.WindowState == FormWindowState.Normal)
                {
                    this.Size = new Size(1360, 768);
                }
                estadoAnterior = this.WindowState;

                if (painelSplash != null && painelSplash.Visible)
                {
                    painelSplash.Location = new Point((this.ClientSize.Width - 400) / 2, (this.ClientSize.Height - 160) / 2);
                }
            };

            this.Load += FormJanelaPrincipal_Load;
        }

        private async void FormJanelaPrincipal_Load(object sender, EventArgs e)
        {
            try
            {
                ProgramaPrincipal.Log("FormJanelaPrincipal_Load iniciado.");

                // Inicia o ambiente WebView2 / Chromium em paralelo com a subida do servidor Node
                var tarefaAmbiente = CoreWebView2Environment.CreateAsync(null, pastaUserData);

                // Aguarda o servidor Node estar pronto em paralelo (em média ~800ms)
                int tentativas = 0;
                while (!ProgramaPrincipal.ServidorOnline(urlInicial + "/api/sistema/saude") && tentativas < 80)
                {
                    await Task.Delay(50);
                    tentativas++;
                }

                ProgramaPrincipal.Log("Servidor online verificado após " + (tentativas * 50) + "ms. Aguardando WebView2Environment...");
                var env = await tarefaAmbiente;
                ProgramaPrincipal.Log("WebView2Environment pronto. Inicializando CoreWebView2...");
                await webView.EnsureCoreWebView2Async(env);
                ProgramaPrincipal.Log("EnsureCoreWebView2Async concluído com sucesso.");

                webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                webView.CoreWebView2.Settings.AreDefaultContextMenusEnabled = true;
                webView.CoreWebView2.Settings.AreDevToolsEnabled = false;
                webView.CoreWebView2.Settings.IsZoomControlEnabled = true;

                bool transicaoConcluida = false;
                Action concluirTransicao = () =>
                {
                    if (transicaoConcluida) return;
                    transicaoConcluida = true;
                    ProgramaPrincipal.Log("Transição do splash para WebView2 concluída.");
                    webView.Visible = true;
                    if (painelSplash != null)
                    {
                        painelSplash.Visible = false;
                    }
                };

                // Revela a aplicação assim que o carregamento da página for completado
                webView.NavigationCompleted += (s, args) =>
                {
                    ProgramaPrincipal.Log("NavigationCompleted recebido (Sucesso: " + args.IsSuccess + ").");
                    concluirTransicao();
                };

                ProgramaPrincipal.Log("Navegando para " + urlInicial + "...");
                webView.CoreWebView2.Navigate(urlInicial);

                // Limite máximo de segurança para garantir a transição mesmo se o evento demorar
                Task.Run(async () =>
                {
                    await Task.Delay(1500);
                    if (!transicaoConcluida && this.IsHandleCreated)
                    {
                        try { this.BeginInvoke(concluirTransicao); } catch { }
                    }
                });
            }
            catch (Exception ex)
            {
                ProgramaPrincipal.Log("ERRO em FormJanelaPrincipal_Load: " + ex.ToString());
                MessageBox.Show("Erro ao inicializar visualização: " + ex.Message, "Gerenciador de Conteúdo", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private string ObterTextoTitulo()
        {
            TimeSpan tempoOnline = DateTime.Now - inicioApp;
            int horas = (int)tempoOnline.TotalHours;
            int minutos = tempoOnline.Minutes;
            int segundos = tempoOnline.Seconds;
            string tempoOnlineStr = string.Format("{0:D2}:{1:D2}:{2:D2}", horas, minutos, segundos);

            DateTime agora = DateTime.Now;
            string dataHoraStr = string.Format("{0:dd-MM-yyyy} | {0:HH:mm:ss}", agora);

            return string.Format("|| {0} - v{1} || Tempo Online : {2} || Data e Horario : {3} ||",
                NOME_APP, VERSAO_APP, tempoOnlineStr, dataHoraStr);
        }

        private void IniciarTituloDinamico()
        {
            this.Text = ObterTextoTitulo();
            timerTitulo = new System.Windows.Forms.Timer { Interval = 1000 };
            timerTitulo.Tick += (s, e) =>
            {
                if (!this.IsDisposed)
                {
                    this.Text = ObterTextoTitulo();
                }
            };
            timerTitulo.Start();
        }

        protected override void OnHandleCreated(EventArgs e)
        {
            base.OnHandleCreated(e);
            AplicarModoEscuroBarraTitulo();
        }

        private void AplicarModoEscuroBarraTitulo()
        {
            try
            {
                int valor = 1;
                if (DwmSetWindowAttribute(this.Handle, DWMWA_USE_IMMERSIVE_DARK_MODE, ref valor, sizeof(int)) != 0)
                {
                    DwmSetWindowAttribute(this.Handle, DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_20H1, ref valor, sizeof(int));
                }

                int corFundoBarra = 0x00170F0B; // BGR para #0B0F17
                DwmSetWindowAttribute(this.Handle, DWMWA_CAPTION_COLOR, ref corFundoBarra, sizeof(int));

                int corTexto = 0x00FFFFFF; // BGR para branco
                DwmSetWindowAttribute(this.Handle, DWMWA_TEXT_COLOR, ref corTexto, sizeof(int));
            }
            catch { }
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {
            ProgramaPrincipal.Log("OnFormClosing disparado. CloseReason: " + e.CloseReason);
            try
            {
                if (timerTitulo != null)
                {
                    timerTitulo.Stop();
                    timerTitulo.Dispose();
                    timerTitulo = null;
                }
            }
            catch { }

            base.OnFormClosing(e);
            if (aoFechar != null)
            {
                aoFechar();
            }
        }
    }
}