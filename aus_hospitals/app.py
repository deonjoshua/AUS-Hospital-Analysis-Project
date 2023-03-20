# import necessary libraries
import os
from flask import (
    Flask,
    render_template,
    jsonify)

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
    __tablename__ = 'Hospitals'

    Hospital_ID = db.Column(db.Text, primary_key=True)
    Hospital_Name = db.Column(db.Text)
    Latitude = db.Column(db.Float)
    Longitude = db.Column(db.Float)
    State = db.Column(db.Text)
    Peer_group_name = db.Column(db.Text)
    Year = db.Column(db.Integer)
    No_of_presentations = db.Column(db.Integer)
    Median_time_in_ED = db.Column(db.Float)

with app.app_context():
    db.create_all()

# create route that renders index.html template
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/hospitals")
def hospitals():
    results = db.session.query(Hospitals.Hospital_ID, Hospitals.Hospital_Name, Hospitals.Latitude, Hospitals.Longitude, Hospitals.State, Hospitals.Peer_group_name, Hospitals.Year, Hospitals.No_of_presentations, Hospitals.Median_time_in_ED).all()

    Hospital_ID = [result[0] for result in results]
    Hospital_Name = [result[1] for result in results]
    Latitude = [result[2] for result in results]
    Longitude = [result[3] for result in results]
    State = [result[4] for result in results]
    Peer_group_name = [result[5] for result in results]
    Year = [result[6] for result in results]
    No_of_presentations = [result[7] for result in results]
    Median_time_in_ED = [result[8] for result in results]
    
    data = [{"Hospital_ID":Hospital_ID,
             "Hospital_Name":Hospital_Name,
             "Latitude":Latitude,
             "Longitude":Longitude,
             "State":State,
             "Peer_group_name":Peer_group_name,
             "Year":Year,
             "No_of_Patients":No_of_presentations,
             "Median_time_in_ED(Hrs)":Median_time_in_ED}]
    
    return jsonify(data)

if __name__ == "__main__":
    app.debug = True
    # run the flask app
    app.run()
