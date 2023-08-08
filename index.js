const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Replace 'YOUR_AIRTABLE_API_KEY' and 'YOUR_BASE_ID' with your actual values
const airtableApiKey =
  "pat9QvqJzD3VsV1BB.fabe8fff3fc4122dfb2e97ca54129caba65f95e018359d1f59865a5ec9025a48";

const airtableBaseId = "appcaive9C3kh05eV";
const airtableTable = "Asana Tasks";

app.post("/webhook", async (req, res) => {
  console.log(req.body);
  try {
    const asanaEvent = req.body;

    if (asanaEvent.resource_type !== "task") {
      console.log("Ignoring non-task event");
      return res.status(200).json({ status: "ignored" });
    }

    const taskID = asanaEvent.resource.gid;
    const name = asanaEvent.resource.name;
    const assignee = asanaEvent.resource.assignee
      ? asanaEvent.resource.assignee.name
      : "Unassigned";
    const dueDate = asanaEvent.resource.due_on || null;
    const description = asanaEvent.resource.notes || "";

    const airtablePayload = {
      fields: {
        "Task ID": taskID,
        Name: name,
        Assignee: assignee,
        "Due Date": dueDate,
        Description: description,
      },
    };

    const airtableApiUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTable}`;
    const airtableHeaders = {
      Authorization: `Bearer ${airtableApiKey}`,
      "Content-Type": "application/json",
    };

    const airtableResponse = await axios.post(airtableApiUrl, airtablePayload, {
      headers: airtableHeaders,
    });

    console.log("Record created in Airtable:", airtableResponse.data);
    res
      .status(201)
      .json({ status: "success", airtableRecord: airtableResponse.data });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
