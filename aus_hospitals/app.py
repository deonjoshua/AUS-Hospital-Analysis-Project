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
import pandas as pd

#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///Hospital_Data.sqlite")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(autoload_with=engine)

# get all the classes
ed_triage = Base.classes.ED_Triage
ed_on_time = Base.classes.ED_on_time
ed_waiting = Base.classes.ED_waiting
ed_waiting_peer_group = Base.classes.ED_waiting_Peer_Group
hospitals = Base.classes.Hospitals
peer_group = Base.classes.Peer_Group

# create session to clean data
session = Session(engine)

# convert to dataframes
ed_triage_df = pd.read_sql(session.query(ed_triage).statement,session.bind)
ed_on_time_df = pd.read_sql(session.query(ed_on_time).statement,session.bind)
ed_waiting_df = pd.read_sql(session.query(ed_waiting).statement,session.bind)
ed_waiting_peer_group_df = pd.read_sql(session.query(ed_waiting_peer_group).statement,session.bind)
hospitals_df = pd.read_sql(session.query(hospitals).statement,session.bind)
peer_group_df = pd.read_sql(session.query(peer_group).statement,session.bind)
peer_group_df['Peer_Group_ID'] = peer_group_df['Peer_group_ID']

# merge dataframes/clean the data

merge_ed = ed_waiting_peer_group_df.merge(peer_group_df[['Peer_group_ID','Peer_group_name']])
merge_ed['Peer_Group_ID']= merge_ed['Peer_group_ID']
merge = ed_on_time_df.merge(ed_triage_df[['Triage_ID','Triage_category','treatment_required_in']])

merge1 = hospitals_df.merge(peer_group_df[['Peer_Group_ID','Peer_group_name']])
merge15 = merge1.merge(merge_ed[["Peer_Group_ID","Avg_Wait_time"]])
merge2 = merge15.merge(ed_waiting_df[['Hospital_ID','Patient_cohort','No_of_presentations','Median_time_in_ED','Year']])
merge2['Total_Patients'] = merge2['No_of_presentations']
merge2['Median_time_in_ED_waiting'] = merge2['Median_time_in_ED']

cleaned_df1 = merge[['Hospital_ID','Year','Triage_category','No_of_presentations','Percentage_of_patients_seen_on_time']]
cleaned_df1['No_of_presentations_ontime'] = cleaned_df1['No_of_presentations']

cleaned_df2 = merge2[['Hospital_ID','Hospital_Name','Latitude','Longitude','State', 'Sector', 'Year','Patient_cohort','Peer_group_name','Total_Patients','Median_time_in_ED_waiting','Avg_Wait_time']]

joined_df = cleaned_df2.merge(cleaned_df1[['Hospital_ID','Year','Triage_category','Percentage_of_patients_seen_on_time']])

grouped_df = joined_df.groupby(['Hospital_ID', 'Year','Triage_category','Patient_cohort']).first().reset_index()

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
        f"/api/Peer_Group<br/>"
        f"/api/joined_data<br/>"        
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

@app.route('/api/joined_data')
def joined_data():
    data = grouped_df.to_dict(orient='records')
    return jsonify(data)

if __name__ == "__main__":
    app.debug = True
    # run the flask app
    app.run()
