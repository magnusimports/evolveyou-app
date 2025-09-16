import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
# Removendo dependências problemáticas
# from src.models.user import db
# from src.routes.user import user_bp
from src.routes.fitness import fitness_bp
from src.routes.advanced_api import advanced_api
from src.routes.anamnese_api_fixed import anamnese_api
from src.routes.dashboard_api import dashboard_api
from src.routes.workout_api import workout_api
from src.routes.nutrition_api import nutrition_api
from src.routes.coach_api import coach_api
# Comentando Firebase para deploy
# from src.routes.fitness_firebase import fitness_firebase_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Habilitar CORS para todas as rotas
CORS(app)

# Registrar apenas rotas funcionais
# app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(fitness_bp, url_prefix='/api/fitness')
app.register_blueprint(advanced_api)
app.register_blueprint(anamnese_api)
app.register_blueprint(dashboard_api)
app.register_blueprint(workout_api)
app.register_blueprint(nutrition_api)
app.register_blueprint(coach_api)
# Comentando Firebase para deploy
# app.register_blueprint(fitness_firebase_bp, url_prefix='/api/firebase')

# Comentando database para deploy
# app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)
# with app.app_context():
#     db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
