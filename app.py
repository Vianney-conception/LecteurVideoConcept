import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from pathlib import Path
from moviepy.editor import VideoFileClip  # Importation de MoviePy
import threading
import os

class VideoProcessorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Processeur Vidéo (MoviePy)")
        self.root.geometry("450x200")

        self.style = ttk.Style()
        self.style.configure('TButton', font=('Helvetica', 10), padding=10)
        self.style.configure('TLabel', font=('Helvetica', 10), padding=5)

        self.main_frame = ttk.Frame(root, padding="20 20 20 20")
        self.main_frame.pack(expand=True, fill=tk.BOTH)

        self.select_button = ttk.Button(
            self.main_frame,
            text="Sélectionner une vidéo à traiter",
            command=self.select_and_process_video
        )
        self.select_button.pack(pady=10, fill='x')

        self.status_label = ttk.Label(
            self.main_frame,
            text="En attente de sélection...",
            wraplength=400,
            justify=tk.CENTER
        )
        self.status_label.pack(pady=10)

        self.progress_bar = ttk.Progressbar(
            self.main_frame,
            orient='horizontal',
            mode='indeterminate'
        )
        self.progress_bar.pack(pady=10, fill='x')

    def select_and_process_video(self):
        file_path_str = filedialog.askopenfilename(
            title="Choisissez un fichier vidéo",
            filetypes=(
                ("Fichiers vidéo", "*.mp4 *.mov *.avi *.mkv"),
                ("Tous les fichiers", "*.*")
            )
        )
        if not file_path_str:
            self.status_label.config(text="Opération annulée.")
            return

        process_thread = threading.Thread(
            target=self.process_video,
            args=(file_path_str,)
        )
        process_thread.start()

    def process_video(self, file_path_str):
        try:
            self.select_button.config(state=tk.DISABLED)
            self.status_label.config(text=f"Traitement de {Path(file_path_str).name}...")
            self.progress_bar.start(10)

            input_path = Path(file_path_str)
            output_path = input_path.with_name(f"{input_path.stem}_Picture.mp4")

            # --- Logique MoviePy ---
            # 1. Charger le clip
            with VideoFileClip(str(input_path)) as clip:
                
                # 2. Écrire le fichier de sortie
                clip.write_videofile(
                    str(output_path),
                    codec='libx264',        # Codec H.264
                    audio=False,            # Retire la bande son
                    ffmpeg_params=['-crf', '51'] # Qualité minimale (0=top, 51=pire)
                )
            # -----------------------

            self.status_label.config(text=f"Terminé ! Fichier sauvegardé :\n{output_path.name}")
            messagebox.showinfo("Succès", f"La vidéo a été traitée avec succès !\n\nSauvegardée sous : {output_path}")

        except (IOError, OSError) as e: 
            # MoviePy lève une IOError si ffmpeg.exe est introuvable ([WinError 2])
            self.status_label.config(text="Erreur : ffmpeg.exe introuvable.")
            print(f"ERREUR CAPTURÉE [WinError 2] : {e}")
            messagebox.showerror(
                "Erreur critique [WinError 2]",
                "Le programme 'ffmpeg.exe' est introuvable.\n\n"
                "MoviePy a besoin de ce programme pour fonctionner.\n\n"
                "SOLUTION :\n"
                "1. Téléchargez FFmpeg.\n"
                "2. Copiez 'ffmpeg.exe' (du dossier 'bin')\n"
                "3. Collez-le dans le MÊME dossier que ce script."
            )
        except Exception as e:
            # Gère toutes les autres erreurs
            self.status_label.config(text="Erreur inconnue.")
            messagebox.showerror("Erreur", f"Une erreur inattendue est survenue :\n\n{str(e)}")
        
        finally:
            self.select_button.config(state=tk.NORMAL)
            self.progress_bar.stop()

# --- Lancement de l'application ---
if __name__ == "__main__":
    # Vérifie si ffmpeg.exe est dans le dossier du script et l'ajoute au PATH
    # Ceci est une astuce pour que MoviePy le trouve
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.environ["PATH"] = script_dir + os.pathsep + os.environ["PATH"]

    root = tk.Tk()
    app = VideoProcessorApp(root)
    root.mainloop()