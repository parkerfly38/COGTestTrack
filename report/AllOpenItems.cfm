<cfhttp url="https://cornerops.axosoft.com/api/oauth2/token?grant_type=password&username=bkresge&password=nugget38&client_id=84a344d7-9034-4ed7-8a01-ba35f9642648&client_secret=yUNiYAek30KibBtietQVo9UktJz8gv8GLdniTvzyv7rzWW4n2Xq0cSmedoJKMB_PUX5aWUyb2y5LXimFX-1wIJeCQocZSF6HTE7Q&scope=read" method="get" result="tokenResult" />
<cfset accessToken = DeSerializeJSON(tokenResult.filecontent).access_token>
<cfhttp url="https://cornerops.axosoft.com/api/v2/incidents/?access_token=#accessToken#" method="get" result="httpResult" />
<cfhttp url="https://cornerops.axosoft.com/api/v2/defects/?access_token=#accessToken#" method="get" result="bugResult" />
<cfset qryClientAcceptance = QueryNew("ID,Title,ReportedDate,CustomerContact,CustomerContactEmail,Client,Status,WorkflowStep,OriginalEstimate,HoursToDate,HoursLeft","varchar,varchar,varchar,varchar,varchar,varchar,varchar,varchar,decimal,decimal,decimal") >
<cfset objData = DeserializeJSON(httpResult.fileContent) />
<cfset objBugData = DeserializeJSON(bugResult.fileContent) />
<cfloop array="#objData['data']#" index="i">
	<cfif i.workflow_step.name DOES NOT CONTAIN "Closed" AND i.custom_fields.custom_1167 eq "AHIC">
		<cfset temp = QueryAddRow(qryClientAcceptance)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"ID",i.number)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"Title",i.name)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"ReportedDate",isnull(i.reported_date) || i.reported_date eq "null" ? DateFormat(ParseDateTime(left(i.created_date_time,10),"yyyy-MM-dd"),"mm/dd/yyyy") : DateFormat(ParseDateTime(left(i.reported_date,10),"yyyy-MM-dd"),"mm/dd/yyyy") )>
		<cfset temp = QuerySetCell(qryClientAcceptance,"CustomerContact",isnull(i.reported_by_customer_contact.name) ? "" : i.reported_by_customer_contact.name)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"CustomerContactEmail",isnull(i.reported_by_customer_contact.email) ? "" : i.reported_by_customer_contact.email)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"Client",i.custom_fields.custom_1167)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"Status",i.status.name)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"WorkflowStep",i.workflow_step.name)>
		<cfset originalestimate = i.estimated_duration.duration_minutes / 60>
		<cfset originalestimate = originalestimate * 100>
		<cfset originalestimate = Round(originalestimate)>
		<cfset originalestimate = originalestimate / 100>
		<cfset temp = QuerySetCell(qryClientAcceptance,"OriginalEstimate",originalestimate)>
		<cfif isnull(i.actual_duration.duration_minutes)>
			<cfset actualduration = 0>
		<cfelse>
			<cfset actualduration =  i.actual_duration.duration_minutes / 60>
			<cfset actualduration = actualduration * 100>
			<cfset actualduration = Round(actualduration)>
			<cfset actualduration = actualduration / 100>
		</cfif>
		<cfset temp = QuerySetCell(qryClientAcceptance,"HoursToDate",actualduration)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"HoursLeft",DecimalFormat((originalestimate) - (actualduration)))>
	</cfif>
</cfloop>
<cfloop array="#objBugData['data']#" index="i">
	<cfif (i.workflow_step.name neq "Fixed" and i.workflow_step.name neq "Rejected") AND i.custom_fields.custom_1196 eq "AHIC">
		<cfset temp = QueryAddRow(qryClientAcceptance)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"ID","BUG" & i.number)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"Title",i.name)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"ReportedDate",isnull(i.reported_date) || i.reported_date eq "null" ? DateFormat(ParseDateTime(left(i.created_date_time,10),"yyyy-MM-dd"),"mm/dd/yyyy") : DateFormat(ParseDateTime(left(i.reported_date,10),"yyyy-MM-dd"),"mm/dd/yyyy") )>
		<cfset temp = QuerySetCell(qryClientAcceptance,"CustomerContact",isnull(i.reported_by_customer_contact.name) ? "" : i.reported_by_customer_contact.name)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"CustomerContactEmail",isnull(i.reported_by_customer_contact.email) ? "" : i.reported_by_customer_contact.email)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"Client",i.custom_fields.custom_1196)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"Status",i.status.name)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"WorkflowStep",i.workflow_step.name)>
		<cfset originalestimate = i.estimated_duration.duration_minutes / 60>
		<cfset originalestimate = originalestimate * 100>
		<cfset originalestimate = Round(originalestimate)>
		<cfset originalestimate = originalestimate / 100>
		<cfset temp = QuerySetCell(qryClientAcceptance,"OriginalEstimate",originalestimate)>
		<cfif isnull(i.actual_duration.duration_minutes)>
			<cfset actualduration = 0>
		<cfelse>
			<cfset actualduration =  i.actual_duration.duration_minutes / 60>
			<cfset actualduration = actualduration * 100>
			<cfset actualduration = Round(actualduration)>
			<cfset actualduration = actualduration / 100>
		</cfif>
		<cfset temp = QuerySetCell(qryClientAcceptance,"HoursToDate",actualduration)>
		<cfset temp = QuerySetCell(qryClientAcceptance,"HoursLeft",DecimalFormat((originalestimate) - (actualduration)))>
	</cfif>
</cfloop>
<cfquery name="qryReport" dbtype="query">
	SELECT * FROM qryClientAcceptance
	ORDER BY WorkflowStep, ID
</cfquery>
<cfquery name="qryCounts" dbtype="query">
	SELECT WorkflowStep, COUNT(WorkflowStep) as WorkflowCount
	FROM qryReport
	GROUP BY WorkflowStep
</cfquery>
<cfreport query="#qryReport#" template="AllOpenItems.cfr" format="PDF">
	<cfreportparam series="1" chart="PieChart" query="#qryCounts#">
</cfreport>

