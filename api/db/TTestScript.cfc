component table="TTestScript" persistent="true"
{
	property name="id" column="id" fieldtype="id" generator="identity";
	property name="TypeID" ormtype="integer";
	property name="ScriptName";
	property name="ScriptDescription";
	property name="ScriptFile";
}