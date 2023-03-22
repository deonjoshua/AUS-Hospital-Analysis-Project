# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    Response)
import json

#################################################
# Flask Setup
#################################################

app = Flask(__name__)

#################################################
# Database Setup
#################################################

from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', '') or "sqlite:///Hospital_Data.sqlite"

# Remove tracking modifications
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Hospitals(db.Model):
    __tablename__ = 'Hospital'

    Hospital_ID = db.Column(db.Text, primary_key=True)
    Hospital_Name = db.Column(db.Text)
    Latitude = db.Column(db.Float)
    Longitude = db.Column(db.Float)
    State = db.Column(db.Text)
    Peer_group_name = db.Column(db.Text)
    No_of_presentations = db.Column(db.Integer)
    Median_time_in_ED = db.Column(db.Float)

class Triage(db.Model):
    __tablename__ = 'Triage'

    Hospital_ID = db.Column(db.Text)
    Triage_ID = db.Column(db.Integer)
    Triage_category = db.Column(db.Text)
    treatment_required_in = db.Column(db.Text)
    No_of_presentations = db.Column(db.Integer)
    Percentage_of_patients_seen_on_time = db.Column(db.Text)
    Index = db.Column(db.Integer, primary_key=True)

with app.app_context():
    db.create_all()

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

# create API route
@app.route("/api/hospitals")
def hospitals():
    results1 = db.session.query(Hospitals.Hospital_ID, Hospitals.Hospital_Name, Hospitals.Latitude, Hospitals.Longitude, Hospitals.State, Hospitals.Peer_group_name, Hospitals.No_of_presentations, Hospitals.Median_time_in_ED).all()

    data = {}

    for result in results1:
        data[result[0]] = {
            "Hospital_ID": result[0],
            "Hospital_Name": result[1],
            "Latitude": result[2],
            "Longitude": result[3],
            "State": result[4],
            "Peer_group_name": result[5],
            "ED_waiting":{ "No_of_Patients": result[6],
                           "Median_time_in_ED": result[7]
                        }
        }

    results2 = db.session.query(Triage.Hospital_ID, Triage.Triage_ID, Triage.Triage_category, Triage.treatment_required_in, Triage.No_of_presentations, Triage.Percentage_of_patients_seen_on_time).all()
    
    for result in results2:
            data[result[0]][result[2]] = {"treatment_required_in":result[3],
                                                  "No_of_Patients":result[4],
                                                  "seen_on_time":result[5]
                                        }
            
    json_data = json.dumps(list(data.values()), sort_keys=False)
    response = Response(json_data, mimetype='application/json')
    return response

@app.route('/map')
def map():
    return render_template('map.html')

if __name__ == "__main__":
    app.debug = True
    # run the flask app
    app.run()