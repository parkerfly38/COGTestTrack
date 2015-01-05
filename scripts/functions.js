var jsonMilestones = [];
var jsonDashMenu = [];
var jsonLinks = [];
var jsonProjectCounts = [];
var jsonProjects = [];
var recentresultscontent = "";
var timervar;
var linkstimervar;
var initialLoadTimer;
var chartheight = 300;
var chartwidth = 840;

$(document).ready(function() {
	$.getJSON("cfc/Dashboard.cfc?method=chartList", function(data) {
		jsonDashMenu = data;
	});
	$.getJSON("cfc/Dashboard.cfc?method=allProjectsCount", function(data){
		jsonProjectCounts = data;
	});
	$.getJSON("cfc/Dashboard.cfc?method=TodosBySection", function(data) {
		$.each(data.DATA,function(index){
			$("#todotable tbody").append("<tr><td>"+data.DATA[index][0]+"</td><td>("+data.DATA[index][1]+")</td></tr>");
		});
	});
	$.getJSON("cfc/Dashboard.cfc?method=MilestonesJSON", function(data) {
		jsonMilestones = data;
	});
	$.getJSON("cfc/Dashboard.cfc?method=LinksJSON", function(data) {
		jsonLinks = data;
	});
	$.getJSON("cfc/Dashboard.cfc?method=allProjectsJSON",function(data){
		jsonProjects = data;
		console.log(jsonProjects);
	});
	$("#actioncontent").load("cfc/Dashboard.cfc?method=Actions", function(){
		$("#actioncontent").append("<div class='panel panel-default'><div class='panel-heading'><i class='fa fa-check-square-o'></i> Todos</div><div class='panel-body'><table id='todotable' class='table table-striped'><tbody></tbody></table></div></div>");
	});
	
	projectIDCheck();
	
	initialLoadTimer = setInterval(function() {homeLoad()},10);
	linkstimervar = setInterval(function() {insertLinks()},10);
	timervar = setInterval(function() {insertAdditional()},10);
	
	$("a#lnkAssignedTests").click(function(event) {
		event.preventDefault();
		var userid = $("a#lnkAssignedTests").attr("userid");
		$("#featurecontent").load("cfc/dashboard.cfc?method=assignedTestsGrid&userid="+userid+"&page=1&pageSize=10");
	});
	$("a#lnkHome").click(function(event) {
		event.preventDefault();
		homeLoad();
	});
	$("a#lnkReturnAllProjects").click(function(event) {
		event.preventDefault();
		$.ajax({ url:"cfc/Dashboard.cfc?method=removeSessionProject",type:"POST"}).done(function()
		{
			projectid = null;
			homeLoad();
		});
	});
	$(document).on("click",".testcaseeditlink",function(event){
		event.preventDefault();
		var editid = $(this).attr("editid");
		$("#largeModal .modal-title").text("Edit Test Case");
		$("#largeModal .modal-body").load("cfc/forms.cfc?method=getTestEditForm&testcaseid="+editid);
		$("#largeModal").modal("show");
	});
	$(document).on("click","a#lnkAddProject",function(event) {
		event.preventDefault();
		$("#largeModal .modal-title").text("Add Project");
		$("#largeModal .modal-body").load("cfc/forms.cfc?method=ProjectForm");
		$("#largeModal").modal("show");
		$(document).trigger("eventLoadForm");
	});
	$(document).on("click","a.pjlink", function(event) {
		event.preventDefault();
		projectid = $(this).attr("pjid");
		$.ajax({ url:"cfc/Dashboard.cfc?method=setSessionProject",type:"POST",data: {projectid : projectid}});
		$("#uldashboard").show();
		projectIDCheck();
		projectLoad();
		
	})
	$(document).on("eventLoadForm", function(event){
		$("#txtProjectStartDate").datepicker({
			format:"mm/dd/yyyy",
			todayHighlight: true
		});
	});
	$(window).resize(function() {
		
	});
});

function projectIDCheck(){
	if ( isNumber(projectid))
	{
		$.ajax({
			url: "cfc/Dashboard.cfc?method=mostRecentTests",
			type: "GET"
		}).done(function(data) {
			recentresultscontent = data;
		});
	}
}

function insertLinks() {
	if (jsonLinks.length > 0) {
		var newcontent = "<div class='panel panel-default'><div class='panel-heading'><i class='fa fa-code'></i> Links</span></div>"
		newcontent += "<div class='panel-body'><table class='table table-striped'><tbody>";
		$.each(jsonLinks,function(index) {
			newcontent += "<tr><td><a href='"+jsonLinks[index].LinkHref+"' style='margin-bottom:5px;text-decoration:none;'><i class='fa fa-link'></i> "+jsonLinks[index].LinkDesc+"</a></td></tr>";
		});
		newcontent += "</tbody></table></div></div>";
		setTimeout(function() {
			$("#actioncontent").append(newcontent);
		},100);
		window.clearInterval(linkstimervar);
	}
}

function insertAdditional() {
	if (recentresultscontent.length > 0) {
		$("#featurecontent").append(recentresultscontent);
		
		window.clearInterval(timervar);
	}
}

function insertDashMenu() {
	$("#activitytitle").append('<div class="btn-group" style="float:right;margin-top:-5px;"><a class="btn btn-sm btn-default" href="#"><i class="fa fa-bar-chart fa-fw"></i> Quick Reports</a><a class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" href="#"><span class="fa fa-caret-down"></span></a><ul class="dropdown-menu"></ul></div>');
	$.each(jsonDashMenu, function(index) {
		$(".dropdown-menu").append("<li><a href='#' class='lnkQuickReport' reportvalue='"+jsonDashMenu[index].optvalue+"'><i class='fa "+jsonDashMenu[index].opticon+" fa-fw'></i> "+jsonDashMenu[index].optlabel+"</a></li>");
	});
	$(".lnkQuickReport").click(function(event) {
		event.preventDefault();
		if ($(this).attr("reportvalue") != "") {
			//$("#featurecontent").load("cfc/Dashboard.cfc?method="+$(this).attr("reportvalue"),function() {
			//	insertDashMenu();
			//	insertAdditional();
			//});
			$.ajax({
				url: "cfc/Dashboard.cfc?method="+$(this).attr("reportvalue"),
				type: "POST",
				data: { projectid : projectid }
			}).done(function(data) {
				$("#featurecontent").html(data);
				insertDashMenu();
				insertAdditional();
				insertMilestones();
				insertScenarios();
			});
		}
	});
}

function insertProjectInfo() {
	if (!($.isEmptyObject(jsonProjects))) {
		$("#featurecontent").append("<div class='panel panel-default'><div class='panel-heading'><i class='fa fa-wrench'></i> Projects</span></div><div id='pjpanelbody' class='panel-body'></div></div>")
		$.each(jsonProjects, function(index){
			var pjcontent = "";
			pjcontent += "<div class='col-xs-1 col-sm-1 col-md-1 col-lg-1 text-right' style='padding-right:0px;'>";
			pjcontent += "<h1 style='margin:0px;'><span class='label label-primary' style='padding:5px;'>";
			pjcontent += "<i class='projects fa fa-wrench fa-fw'></i></span></h1></div>";
			pjcontent += "<div class='col-xs-11 col-sm-11 col-md-11 col-lg-11'><h4><a href='#' class='pjlink' pjid='" + jsonProjects[index].id + "'>"+jsonProjects[index].ProjectTitle+"</a></h4>";
			pjcontent += "<a href='#'>Todos</a>&nbsp;&nbsp;|&nbsp;&nbsp;";
			pjcontent += "<a href='#'>Milestones</a>&nbsp;&nbsp;|&nbsp;&nbsp;";
			pjcontent += "<a href='#'>Tests</a>&nbsp;&nbsp;|&nbsp;&nbsp;";
			if (jsonProjects[index].RepositoryType == 2)
				pjcontent += "<a href='#'>Test Collections</a>&nbsp;&nbsp;|&nbsp;&nbsp;";
			pjcontent += "<a href='#'>Reporting</a></div><div class='clearfix' style='margin-bottom:20px;'></div>";
			$("#pjpanelbody").append(pjcontent);
		});
	}
}

function casesLoad(projectid) {
	
}

function projectLoad() {
	$.ajax({
		url: "cfc/Dashboard.cfc?method=HubChart",
		type: "POST",
		data: {
			projectid : projectid
		}
	}).done(function(data){
		$("#featurecontent").html(data);
		insertDashMenu();
		insertAdditional();
		insertMilestones();
		insertScenarios();
	});
}

function insertMilestones() {
	$.ajax({
		url: "cfc/dashboard.cfc?method=getMilestones",
		type: "post",
		data: { projectid : projectid }
	}).done(function(data){
		$("#topcontent").after(data);
	});
}

function insertScenarios() {
	$.ajax({
		url: "cfc/dashboard.cfc?method=getTestScenarios",
		type: "post",
		data: {projectid : projectid }
	}).done(function(data) {
		$("#topcontent").after(data);
	});
}

function homeLoad() {
	if ( isNumber(projectid)  )
	{
		$.ajax({
				url: "cfc/Dashboard.cfc?method=HubChart",
				type: "POST",
				data: { projectid : projectid }
			}).done(function(data) {
				$("#featurecontent").html(data);
				insertDashMenu();
				insertAdditional();
				insertMilestones();
				insertScenarios();
			});
		window.clearInterval(initialLoadTimer);
		return; 
	}
	if ( !($.isEmptyObject(jsonProjectCounts))) {
		if (jsonProjectCounts.TotalProjects > 0) {
			$("#featurecontent").load("cfc/Dashboard.cfc?method=AllProjectsChart",function() {
				insertProjectInfo();
				$("#uldashboard").hide();
			});
		} else {
			$("#featurecontent").html("<div class='alert alert-danger' role='alert'><strong>Add your first project to CFTestTrack</strong><br />Welcome!  This dashboard displays an overview of available projects and recent activity, but there aren't any projects yet.  Add a new project from the Actions menu on the right.</div>");
		}
		window.clearInterval(initialLoadTimer);
	}
}