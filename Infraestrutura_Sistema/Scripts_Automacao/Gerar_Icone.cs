using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

namespace GerenciadorConteudo
{
    class GeradorIcone
    {
        static void Main(string[] args)
        {
            string pastaDestino = AppDomain.CurrentDomain.BaseDirectory;
            if (args.Length > 0) pastaDestino = args[0];

            if (!Directory.Exists(pastaDestino))
            {
                Directory.CreateDirectory(pastaDestino);
            }

            int[] tamanhos = new int[] { 256, 128, 64, 48, 32, 16 };
            byte[][] frameBuffers = new byte[tamanhos.Length][];

            for (int i = 0; i < tamanhos.Length; i++)
            {
                int sz = tamanhos[i];
                using (Bitmap bmp = DesenharIcone(sz))
                {
                    if (sz == 256)
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            bmp.Save(ms, ImageFormat.Png);
                            frameBuffers[i] = ms.ToArray();
                        }
                        string caminhoPng = Path.Combine(pastaDestino, "Icone_Padrao.png");
                        File.WriteAllBytes(caminhoPng, frameBuffers[i]);
                        Console.WriteLine("✓ Criado: " + caminhoPng);
                    }
                    else
                    {
                        frameBuffers[i] = ConverterBitmapParaDib(bmp);
                    }
                }
            }

            // Monta o arquivo .ICO compatível com todas as resoluções do Windows e csc /win32icon
            string caminhoIco = Path.Combine(pastaDestino, "Icone_Padrao.ico");
            SalvarIconeMultiRes(caminhoIco, tamanhos, frameBuffers);
            Console.WriteLine("✓ Criado: " + caminhoIco);
        }

        static byte[] ConverterBitmapParaDib(Bitmap bmp)
        {
            int width = bmp.Width;
            int height = bmp.Height;
            int xorSize = width * height * 4;
            int andMaskRowSize = ((width + 31) / 32) * 4;
            int andMaskSize = andMaskRowSize * height;
            int dibSize = 40 + xorSize + andMaskSize;

            byte[] dib = new byte[dibSize];
            using (MemoryStream ms = new MemoryStream(dib))
            using (BinaryWriter bw = new BinaryWriter(ms))
            {
                // BITMAPINFOHEADER (40 bytes)
                bw.Write((uint)40);                      // biSize
                bw.Write((int)width);                    // biWidth
                bw.Write((int)(height * 2));             // biHeight (XOR mask height + AND mask height)
                bw.Write((ushort)1);                     // biPlanes
                bw.Write((ushort)32);                    // biBitCount
                bw.Write((uint)0);                       // biCompression = BI_RGB
                bw.Write((uint)(xorSize + andMaskSize)); // biSizeImage
                bw.Write((int)0);                        // biXPelsPerMeter
                bw.Write((int)0);                        // biYPelsPerMeter
                bw.Write((uint)0);                       // biClrUsed
                bw.Write((uint)0);                       // biClrImportant

                // Pixels 32bpp BGRA Bottom-Up
                BitmapData bd = bmp.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.ReadOnly, PixelFormat.Format32bppArgb);
                try
                {
                    byte[] row = new byte[width * 4];
                    for (int y = height - 1; y >= 0; y--)
                    {
                        IntPtr rowPtr = new IntPtr(bd.Scan0.ToInt64() + y * bd.Stride);
                        System.Runtime.InteropServices.Marshal.Copy(rowPtr, row, 0, row.Length);
                        bw.Write(row);
                    }
                }
                finally
                {
                    bmp.UnlockBits(bd);
                }

                // Máscara AND de 1-bit por pixel (zeros para transparência via canal alpha)
                byte[] andMask = new byte[andMaskSize];
                bw.Write(andMask);
            }
            return dib;
        }

        static Bitmap DesenharIcone(int tamanho)
        {
            Bitmap bmp = new Bitmap(tamanho, tamanho, PixelFormat.Format32bppArgb);
            using (Graphics g = Graphics.FromImage(bmp))
            {
                g.SmoothingMode = SmoothingMode.AntiAlias;
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;

                float escala = tamanho / 256.0f;

                // 1. Fundo Squircle (Retângulo Arredondado Moderno)
                float raio = 54 * escala;
                float margem = 8 * escala;
                float largura = tamanho - (margem * 2);

                using (GraphicsPath caminhoFundo = CriarRetanguloArredondado(margem, margem, largura, largura, raio))
                {
                    // Gradiente de Fundo Profundo
                    using (LinearGradientBrush pincelFundo = new LinearGradientBrush(
                        new PointF(0, 0),
                        new PointF(tamanho, tamanho),
                        ColorTranslator.FromHtml("#0B0F17"),
                        ColorTranslator.FromHtml("#18182E")))
                    {
                        g.FillPath(pincelFundo, caminhoFundo);
                    }

                    // Borda sutil com gradiente neon azul/roxo
                    using (LinearGradientBrush pincelBorda = new LinearGradientBrush(
                        new PointF(0, 0),
                        new PointF(tamanho, tamanho),
                        ColorTranslator.FromHtml("#3B82F6"),
                        ColorTranslator.FromHtml("#8B5CF6")))
                    using (Pen canetaBorda = new Pen(pincelBorda, Math.Max(1.5f, 3.5f * escala)))
                    {
                        g.DrawPath(canetaBorda, caminhoFundo);
                    }
                }

                // 2. Anéis Orbitais / Conexões Multi-Plataforma
                using (LinearGradientBrush pincelOrbita = new LinearGradientBrush(
                    new PointF(40 * escala, 40 * escala),
                    new PointF(216 * escala, 216 * escala),
                    ColorTranslator.FromHtml("#2563EB"),
                    ColorTranslator.FromHtml("#EC4899")))
                using (Pen canetaOrbita = new Pen(pincelOrbita, Math.Max(1.5f, 4.0f * escala)))
                {
                    canetaOrbita.DashStyle = DashStyle.Solid;
                    g.DrawEllipse(canetaOrbita, 48 * escala, 48 * escala, 160 * escala, 160 * escala);
                }

                // 3. Emblema Central: Losango / Play Dinâmico com Gradiente Vibrante
                GraphicsPath caminhoEmblema = new GraphicsPath();
                PointF[] pontosPlay = new PointF[]
                {
                    new PointF(96 * escala, 72 * escala),
                    new PointF(184 * escala, 128 * escala),
                    new PointF(96 * escala, 184 * escala)
                };
                caminhoEmblema.AddPolygon(pontosPlay);

                using (LinearGradientBrush pincelEmblema = new LinearGradientBrush(
                    new PointF(90 * escala, 70 * escala),
                    new PointF(190 * escala, 190 * escala),
                    ColorTranslator.FromHtml("#38BDF8"),
                    ColorTranslator.FromHtml("#A855F7")))
                {
                    g.FillPath(pincelEmblema, caminhoEmblema);
                }

                // 4. Raio Central em Branco Puro
                GraphicsPath caminhoRaio = new GraphicsPath();
                PointF[] pontosRaio = new PointF[]
                {
                    new PointF(124 * escala, 92 * escala),
                    new PointF(108 * escala, 130 * escala),
                    new PointF(128 * escala, 130 * escala),
                    new PointF(118 * escala, 164 * escala),
                    new PointF(148 * escala, 122 * escala),
                    new PointF(128 * escala, 122 * escala)
                };
                caminhoRaio.AddPolygon(pontosRaio);

                using (SolidBrush pincelBranco = new SolidBrush(Color.White))
                {
                    g.FillPath(pincelBranco, caminhoRaio);
                }

                // 5. Nós Satélites Representando as Redes Sociais
                float[][] nos = new float[][]
                {
                    new float[] { 128, 48, 10, 0xFF, 0x00, 0x00 },  // YouTube (Topo)
                    new float[] { 208, 128, 10, 0xE1, 0x30, 0x6C }, // Instagram (Direita)
                    new float[] { 178, 196, 9, 0x18, 0x77, 0xF2 },  // Facebook (Inferior Dir)
                    new float[] { 78, 196, 9, 0x00, 0xF2, 0xFE },   // TikTok (Inferior Esq)
                    new float[] { 48, 128, 9, 0xFF, 0x66, 0x00 }    // Kwai (Esquerda)
                };

                foreach (float[] no in nos)
                {
                    float cx = no[0] * escala;
                    float cy = no[1] * escala;
                    float r = no[2] * escala;
                    Color cor = Color.FromArgb((int)no[3], (int)no[4], (int)no[5]);

                    using (SolidBrush pincelNo = new SolidBrush(cor))
                    {
                        g.FillEllipse(pincelNo, cx - r, cy - r, r * 2, r * 2);
                    }
                    using (Pen canetaBordaNo = new Pen(Color.White, Math.Max(1f, 2f * escala)))
                    {
                        g.DrawEllipse(canetaBordaNo, cx - r, cy - r, r * 2, r * 2);
                    }
                }
            }
            return bmp;
        }

        static GraphicsPath CriarRetanguloArredondado(float x, float y, float w, float h, float r)
        {
            GraphicsPath path = new GraphicsPath();
            float d = r * 2;
            path.AddArc(x, y, d, d, 180, 90);
            path.AddArc(x + w - d, y, d, d, 270, 90);
            path.AddArc(x + w - d, y + h - d, d, d, 0, 90);
            path.AddArc(x, y + h - d, d, d, 90, 90);
            path.CloseFigure();
            return path;
        }

        static void SalvarIconeMultiRes(string caminhoIco, int[] tamanhos, byte[][] pngs)
        {
            using (FileStream fs = new FileStream(caminhoIco, FileMode.Create, FileAccess.Write))
            using (BinaryWriter bw = new BinaryWriter(fs))
            {
                // ICONDIR
                bw.Write((ushort)0); // idReserved
                bw.Write((ushort)1); // idType = 1 (.ico)
                bw.Write((ushort)tamanhos.Length); // idCount

                int offsetAtual = 6 + (16 * tamanhos.Length);

                // ICONDIRENTRY para cada imagem
                for (int i = 0; i < tamanhos.Length; i++)
                {
                    int sz = tamanhos[i];
                    byte bSz = sz >= 256 ? (byte)0 : (byte)sz;

                    bw.Write(bSz);                   // bWidth
                    bw.Write(bSz);                   // bHeight
                    bw.Write((byte)0);               // bColorCount
                    bw.Write((byte)0);               // bReserved
                    bw.Write((ushort)1);             // wPlanes
                    bw.Write((ushort)32);            // wBitCount
                    bw.Write((uint)pngs[i].Length);   // dwBytesInRes
                    bw.Write((uint)offsetAtual);      // dwImageOffset

                    offsetAtual += pngs[i].Length;
                }

                // Escreve os dados PNG de cada imagem
                for (int i = 0; i < tamanhos.Length; i++)
                {
                    bw.Write(pngs[i]);
                }
            }
        }
    }
}
