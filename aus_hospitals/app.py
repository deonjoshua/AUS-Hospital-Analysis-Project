# import necessary libraries
import os

from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///Hospital_Data.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(autoload_with=engine)

# create a session object
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes
#################################################
@app.route("/")
def all_tables():
    """All Routes"""
    return (
        f"/api/ED_Triage<br/>"
        f"/api/ED_on_time<br/>"
        f"/api/ED_waiting<br/>"
        f"/api/ED_waiting_Peer_Group<br/>"
        f"/api/Hospitals<br/>"
        f"/api/Peer_Group"        
    )

@app.route('/api/ED_Triage')
def ED_Triage():
    table = Base.classes.ED_Triage
    data = session.query(table).all()
    session.close()
    result = []
    for row in data:
        result.append({
            'triage_id':row.Triage_ID,
            'triage_category':row.Triage_category,
            'treatment_required_in':row.treatment_required_in
        })
    return jsonify(result)

@app.route('/api/ED_on_time')
def ED_on_time():
    table = Base.classes.ED_on_time
    data = session.query(table).all()
    session.close()
    result = []
    for row in data:
        result.append({
            'hospital_id':row.Hospital_ID,
            'year':row.Year,
            'triage_id':row.Triage_ID,
            'no_of_presentations':row.No_of_presentations,
            'percentage_of_patients_seen_onm_time':row.Percentage_of_patients_seen_on_time
        })
    return jsonify(result)

@app.route('/api/ED_waiting')
def ED_waiting():
    table = Base.classes.ED_waiting
    data = session.query(table).all()
    session.close()
    result = []
    for row in data:
        result.append({
            'hospital_id':row.Hospital_ID,
            'year':row.Year,
            'patient_cohort':row.Patient_cohort,
            'no_of_presentations':row.No_of_presentations,
            'median_time_in_ed':row.Median_time_in_ED
          })
    return jsonify(result)

@app.route('/api/ED_waiting_Peer_Group')
def ED_waiting_Peer_Group():
    table = Base.classes.ED_waiting_Peer_Group
    data = session.query(table).all()
    session.close()
    result = []
    for row in data:
        result.append({
            'peer_group_id':row.Peer_group_ID,
            'year':row.Year,
            'patient_cohort':row.Patient_cohort,
            'avg_wait_time_hr':row.Avg_Wait_time            
        })
    return jsonify(result)

@app.route('/api/Hospitals')
def Hospitals():
    table = Base.classes.Hospitals
    data = session.query(table).all()
    session.close()
    result = []
    for row in data:
        result.append({
            'hospital_id':row.Hospital_ID,
            'hospital_name':row.Hospital_Name,
            'latitude':row.Latitude,
            'longitude':row.Longitude,
            'sector':row.Sector,
            'peer_group_id':row.Peer_Group_ID,
            'state':row.State,
            'lhn':row.LHN,
            'phn':row.PHN
        })
    return jsonify(result)

@app.route('/api/Peer_Group')
def Peer_Group():
    table = Base.classes.Peer_Group
    data = session.query(table).all()
    session.close()
    result = []
    for row in data:
        result.append({
            'peer_group_id':row.Peer_group_ID,
            'peer_group_name':row.Peer_group_name
        })
    return jsonify(result)

if __name__ == "__main__":
    app.debug = True
    # run the flask app
    app.run()
