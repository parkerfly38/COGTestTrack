USE [COGData]
GO

/****** Object:  Table [dbo].[TTestTester]    Script Date: 1/3/2015 10:34:33 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[TTestTester](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[ADID] [nvarchar](50) NOT NULL,
	[UserName] [nvarchar](255) NOT NULL,
 CONSTRAINT [PK_TTestTester] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

