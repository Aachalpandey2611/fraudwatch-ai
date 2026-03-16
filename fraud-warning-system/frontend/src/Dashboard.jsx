import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/api/activities")
      .then((res) => {
        setActivities(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Fraud Detection Dashboard</h1>

      <h2>Employee Activities</h2>

      {activities.map((activity, index) => (
        <div
          key={index}
          style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}
        >
          <p>
            <b>Employee:</b> {activity.employeeName}
          </p>
          <p>
            <b>Action:</b> {activity.actionType}
          </p>
          <p>
            <b>Department:</b> {activity.department}
          </p>
          <p>
            <b>Location:</b> {activity.location}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
