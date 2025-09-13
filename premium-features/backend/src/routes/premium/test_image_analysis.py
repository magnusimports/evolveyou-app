import unittest
import os
import sys
from flask import Flask

# Adiciona o diretório pai ao sys.path para permitir importações relativas
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from src.routes.image_analysis import image_analysis_bp

class ImageAnalysisTestCase(unittest.TestCase):

    def setUp(self):
        self.app = Flask(__name__)
        self.app.register_blueprint(image_analysis_bp, url_prefix='/api/image_analysis')
        self.client = self.app.test_client()
        self.app.testing = True

    def test_analyze_image_no_file(self):
        response = self.client.post("/api/image_analysis/analyze_image")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Nenhuma imagem fornecida", response.json["error"])

    def test_analyze_image_empty_file(self):
        data = {"image": (bytes(), "")}
        response = self.client.post("/api/image_analysis/analyze_image", data=data, content_type="multipart/form-data")
        self.assertEqual(response.status_code, 400)
        self.assertIn("Nenhum arquivo selecionado", response.json["error"])

    def test_analyze_image_success(self):
        # Simula o upload de um arquivo de imagem
        with open("test_image.jpg", "wb") as f:
            f.write(b"fake_image_content")

        with open("test_image.jpg", "rb") as img:
            data = {"image": (img, "test_image.jpg")}
            response = self.client.post("/api/image_analysis/analyze_image", data=data, content_type="multipart/form-data")

        os.remove("test_image.jpg") # Limpa o arquivo de teste

        self.assertEqual(response.status_code, 200)
        self.assertIn("Imagem recebida e analisada (simulado)", response.json["message"])
        self.assertIn("Análise simulada", response.json["analysis"])

if __name__ == '__main__':
    unittest.main()


