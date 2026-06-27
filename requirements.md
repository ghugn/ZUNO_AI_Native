# Requirements Document - ZUNO Banking Module Transformation

## Introduction

Tài liệu này định nghĩa các yêu cầu để chuyển đổi ZUNO từ ứng dụng quản lý tài chính cá nhân độc lập thành một Behavioral Finance Module tích hợp trực tiếp vào hệ sinh thái ngân hàng số. Module này sẽ hoạt động như một lớp Behavioral Intelligence Layer, giúp khách hàng trẻ hình thành kỷ luật tài chính thông qua quản lý ngân sách vi mô, cảnh báo hành vi chi tiêu theo thời gian thực và chuyển đổi tiền nhàn rỗi thành tài sản sinh lãi.

Vision dài hạn là biến ZUNO thành nền tảng behavioral analytics cho ngân hàng, tăng CASA (Current Account Savings Account), tăng tỷ lệ chuyển đổi tiết kiệm, tăng engagement trên ứng dụng mobile banking và tạo cơ sở dữ liệu hành vi khách hàng để cross-sell trong tương lai.

## Glossary

- **ZUNO_Module**: Module tài chính hành vi tích hợp trong ứng dụng ngân hàng số
- **Banking_App**: Ứng dụng ngân hàng số chính (mobile banking app)
- **Core_Banking_System**: Hệ thống core banking backend của ngân hàng
- **Transaction_Stream**: Luồng giao dịch thời gian thực từ Core Banking
- **Fund_System**: Hệ thống 5 quỹ tài chính (Living, Food, Growth, Experience, Future)
- **Overflow_Engine**: Động cơ xử lý cơ chế 3 Lố (3-level behavioral intervention)
- **Atomic_Budget**: Ngân sách được chia nhỏ theo ngày/tuần thay vì theo tháng
- **Pre_Spending_Alert**: Cảnh báo trước khi giao dịch được thực hiện
- **Behavioral_Intelligence_Layer**: Lớp phân tích và can thiệp hành vi tài chính
- **CASA**: Current Account and Savings Account
- **Savings_Conversion_Rate**: Tỷ lệ chuyển đổi tiền nhàn rỗi thành tiết kiệm
- **Open_Banking_API**: API chuẩn mở cho việc tích hợp dịch vụ tài chính
- **Mock_Core_Banking**: Cơ sở dữ liệu mô phỏng core banking cho giai đoạn MVP
- **Latte_Factor**: Các khoản chi tiêu nhỏ lặp lại tích lũy thành số tiền lớn
- **Smart_Categorizer**: Bộ phân loại giao dịch thông minh 3 lớp
- **Merchant_Database**: Cơ sở dữ liệu thông tin merchant
- **Deep_Link**: Liên kết sâu từ ZUNO_Module sang các tính năng Banking_App
- **Financial_Health_Score**: Điểm số đánh giá sức khỏe tài chính
- **AWS_Bedrock**: Dịch vụ AI/ML của AWS để phân loại giao dịch
- **Rule_Engine**: Động cơ xử lý logic dựa trên luật
- **SDK_Integration**: Tích hợp dưới dạng Software Development Kit
- **Module_Integration**: Tích hợp dưới dạng module độc lập trong app
- **Authentication_Service**: Dịch vụ xác thực người dùng (AWS Cognito)
- **Session_Token**: Token phiên làm việc từ Banking_App
- **User_Consent**: Sự đồng ý của người dùng để sử dụng behavioral analytics

## Requirements

### Requirement 1: Architecture Transformation

**User Story:** Là kiến trúc sư hệ thống, tôi muốn chuyển đổi ZUNO từ standalone app sang embedded module, để khách hàng có thể sử dụng tính năng behavioral finance trực tiếp trong Banking_App mà không cần cài đặt ứng dụng riêng biệt.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL be packaged as an independent module that can be embedded into Banking_App
2. WHERE deployment is MVP demo, THE ZUNO_Module SHALL connect to Mock_Core_Banking database
3. WHERE deployment is production, THE ZUNO_Module SHALL integrate with Core_Banking_System via Open_Banking_API
4. THE ZUNO_Module SHALL maintain its own database schema for behavioral analytics data
5. WHEN Banking_App initializes, THE ZUNO_Module SHALL be loaded without affecting Banking_App performance
6. THE ZUNO_Module SHALL support both SDK_Integration and Module_Integration approaches
7. THE ZUNO_Module SHALL use existing Authentication_Service from Banking_App
8. WHEN user logs into Banking_App, THE ZUNO_Module SHALL automatically authenticate using Session_Token

### Requirement 2: Core Banking Integration

**User Story:** Là product owner, tôi muốn ZUNO_Module tích hợp với Transaction_Stream từ Core_Banking_System, để có thể phân tích và can thiệp hành vi chi tiêu theo thời gian thực.

#### Acceptance Criteria

1. WHEN a transaction occurs in Core_Banking_System, THE Transaction_Stream SHALL push transaction data to ZUNO_Module within 500 milliseconds
2. THE ZUNO_Module SHALL subscribe to Transaction_Stream using webhook mechanism
3. THE Transaction_Stream SHALL include transaction amount, merchant information, category, timestamp, and account balance
4. WHEN Transaction_Stream data is received, THE ZUNO_Module SHALL parse and normalize transaction data
5. IF Transaction_Stream connection fails, THEN THE ZUNO_Module SHALL log error and retry connection with exponential backoff up to 5 attempts
6. THE ZUNO_Module SHALL support batch synchronization for historical transactions within the last 90 days
7. WHEN user enables ZUNO_Module for the first time, THE ZUNO_Module SHALL request User_Consent for accessing transaction data

### Requirement 3: Pre-Spending Risk Engine

**User Story:** Là người dùng trẻ, tôi muốn nhận cảnh báo trước khi thực hiện giao dịch có thể làm lố ngân sách, để có thể đưa ra quyết định chi tiêu sáng suốt hơn.

#### Acceptance Criteria

1. WHEN a transaction is about to be executed, THE Pre_Spending_Alert SHALL evaluate transaction against current Atomic_Budget
2. IF transaction will cause budget overflow, THEN THE Pre_Spending_Alert SHALL display warning notification to user within 200 milliseconds
3. THE Pre_Spending_Alert SHALL show remaining budget, overflow amount, and affected fund type
4. THE Pre_Spending_Alert SHALL use Rule_Engine for evaluation logic without AI in MVP phase
5. WHERE user chooses to proceed with transaction, THE Pre_Spending_Alert SHALL record user decision for behavioral learning
6. WHERE user chooses to cancel transaction, THE Pre_Spending_Alert SHALL log cancellation event
7. THE Pre_Spending_Alert SHALL integrate into Banking_App transaction flow without blocking transaction execution
8. IF Pre_Spending_Alert service is unavailable, THEN THE Banking_App SHALL allow transaction to proceed normally

### Requirement 4: Smart Transaction Categorization

**User Story:** Là data analyst, tôi muốn hệ thống tự động phân loại giao dịch chính xác, để giảm thiểu công việc thủ công và cải thiện chất lượng dữ liệu behavioral analytics.

#### Acceptance Criteria

1. WHEN a transaction is received, THE Smart_Categorizer SHALL attempt categorization using three-layer approach
2. THE Smart_Categorizer SHALL first check category from Core_Banking_System metadata
3. IF Core_Banking_System category is unavailable, THEN THE Smart_Categorizer SHALL apply Rule_Engine based on merchant name and transaction pattern
4. IF Rule_Engine cannot determine category, THEN THE Smart_Categorizer SHALL invoke AWS_Bedrock for AI-based categorization
5. THE Smart_Categorizer SHALL map transaction to one of five fund types: Living, Food, Growth, Experience, or Future
6. WHEN AWS_Bedrock returns category, THE Smart_Categorizer SHALL include confidence score
7. IF confidence score is below 0.70, THEN THE Smart_Categorizer SHALL flag transaction for manual review
8. THE Smart_Categorizer SHALL store categorization result, method used, and confidence score in behavioral analytics database
9. WHEN user corrects a category, THE Smart_Categorizer SHALL update Merchant_Database and retrain Rule_Engine

### Requirement 5: Atomic Budgeting Engine

**User Story:** Là sinh viên, tôi muốn quản lý ngân sách theo ngày và tuần thay vì theo tháng, để dễ dàng kiểm soát chi tiêu hàng ngày và tránh cạn tiền giữa tháng.

#### Acceptance Criteria

1. THE Atomic_Budget SHALL divide monthly income into daily budgets for Food fund
2. THE Atomic_Budget SHALL divide monthly income into weekly budgets for Growth and Experience funds
3. THE Atomic_Budget SHALL maintain separate daily budget for main meals and supplementary meals
4. WHEN a new day starts at 00:00:00, THE Atomic_Budget SHALL initialize daily budget based on Fund_System allocation
5. WHEN a transaction is categorized as food expense, THE Atomic_Budget SHALL deduct amount from appropriate meal budget
6. THE Atomic_Budget SHALL calculate remaining budget in real-time after each transaction
7. IF daily budget reaches zero, THEN THE Atomic_Budget SHALL trigger Overflow_Engine level 1
8. THE Atomic_Budget SHALL allow user to customize daily and weekly budget percentages
9. WHEN user updates budget percentage, THE Atomic_Budget SHALL recalculate all future budgets while preserving historical data

### Requirement 6: Three-Level Overflow Mechanism (3 Lố)

**User Story:** Là người dùng, tôi muốn nhận can thiệp hành vi phù hợp khi chi tiêu vượt ngân sách, để có cơ hội điều chỉnh hành vi trước khi rơi vào khó khăn tài chính nghiêm trọng.

#### Acceptance Criteria

1. WHEN Atomic_Budget is exceeded, THE Overflow_Engine SHALL determine overflow level based on deficit amount and frequency
2. IF overflow is first occurrence and amount is less than 20% of daily budget, THEN THE Overflow_Engine SHALL trigger Level 1 soft warning
3. WHEN Level 1 is triggered, THE Overflow_Engine SHALL suggest reducing supplementary meal budget and provide budget adjustment options
4. IF overflow amount exceeds 20% of daily budget OR is second occurrence in same week, THEN THE Overflow_Engine SHALL trigger Level 2 fund borrowing
5. WHEN Level 2 is triggered, THE Overflow_Engine SHALL allow borrowing from Growth or Experience funds with notification of consequences
6. THE Overflow_Engine SHALL record borrowing amount, source fund, and create repayment tracking record
7. IF overflow causes total weekly deficit exceeding 50% of weekly budget OR is third occurrence in same week, THEN THE Overflow_Engine SHALL trigger Level 3 financial emergency
8. WHEN Level 3 is triggered, THE Overflow_Engine SHALL display critical warning and suggest withdrawing from Future fund (savings)
9. THE Overflow_Engine SHALL provide Deep_Link to savings withdrawal function in Banking_App
10. THE Overflow_Engine SHALL record all overflow events with timestamp, level, amount, and user response for behavioral analysis

### Requirement 7: Five-Fund Financial Framework

**User Story:** Là người dùng mới, tôi muốn hệ thống tự động phân bổ thu nhập vào 5 quỹ theo khuyến nghị, để có cơ cấu tài chính cân bằng ngay từ đầu.

#### Acceptance Criteria

1. THE Fund_System SHALL maintain five fund types: Living (fixed bills), Food (daily meals), Growth (learning), Experience (entertainment), and Future (long-term savings)
2. WHEN user completes onboarding, THE Fund_System SHALL create five funds with allocation percentages based on residence type
3. WHERE residence type is dormitory, THE Fund_System SHALL allocate: Living 15%, Food 30%, Growth 15%, Experience 20%, Future 20%
4. WHERE residence type is rental, THE Fund_System SHALL allocate: Living 30%, Food 25%, Growth 15%, Experience 15%, Future 15%
5. THE Fund_System SHALL allow user to customize allocation percentages with constraint that sum equals 100%
6. WHEN monthly income is received, THE Fund_System SHALL automatically distribute amount to five funds based on allocation percentages
7. THE Fund_System SHALL prevent transfers from Future fund without user explicit confirmation
8. WHEN month ends, THE Fund_System SHALL perform rollover process to transfer unspent amounts to Future fund
9. THE Fund_System SHALL maintain version history for fund allocations

### Requirement 8: Savings Growth Fund Integration

**User Story:** Là người dùng, tôi muốn tiền nhàn rỗi trong Future fund tự động sinh lãi, để tối ưu hóa lợi nhuận từ tiền tiết kiệm mà không cần quản lý thủ công.

#### Acceptance Criteria

1. WHEN Future fund balance exceeds minimum threshold of 500,000 VND, THE ZUNO_Module SHALL suggest converting to interest-bearing savings account
2. THE ZUNO_Module SHALL provide Deep_Link to Banking_App savings product selection page
3. THE ZUNO_Module SHALL display projected interest earnings based on current balance and interest rates from Banking_App
4. WHEN user creates savings account via Deep_Link, THE ZUNO_Module SHALL track linked savings account ID
5. THE ZUNO_Module SHALL fetch interest rate and balance updates from Core_Banking_System daily at 00:30:00
6. THE ZUNO_Module SHALL display savings growth progress with visual indicators showing accumulated interest
7. THE ZUNO_Module SHALL calculate compound interest projection for 3, 6, and 12 month periods
8. WHEN savings account reaches maturity, THE ZUNO_Module SHALL send notification with options to renew or transfer to Future fund

### Requirement 9: E-commerce Behavioral Analytics

**User Story:** Là người dùng trẻ hay mua sắm online, tôi muốn theo dõi và nhận cảnh báo về các khoản chi tiêu e-commerce, để nhận ra các khoản chi nhỏ lặp lại (Latte Factor) đang ảnh hưởng đến tài chính của mình.

#### Acceptance Criteria

1. WHEN a transaction is categorized as e-commerce, THE ZUNO_Module SHALL tag it for behavioral analytics tracking
2. THE ZUNO_Module SHALL identify recurring small purchases from same merchant within 30-day rolling window
3. WHEN recurring purchases are detected, THE ZUNO_Module SHALL calculate total amount and frequency
4. IF total recurring purchase amount exceeds 15% of monthly Experience fund allocation, THEN THE ZUNO_Module SHALL generate Latte_Factor alert
5. THE Latte_Factor alert SHALL display merchant name, frequency, total amount, and percentage of Experience fund
6. THE ZUNO_Module SHALL provide comparison showing equivalent value in savings if spending was reduced
7. WHEN Experience fund budget for e-commerce subcategory is exceeded, THE ZUNO_Module SHALL send pre-purchase warning before next e-commerce transaction
8. THE ZUNO_Module SHALL generate weekly e-commerce spending summary with category breakdown

### Requirement 10: Analytics Dashboard

**User Story:** Là người dùng, tôi muốn xem dashboard phân tích tổng quan về tình hình tài chính của mình, để hiểu rõ thói quen chi tiêu và tiến độ tiết kiệm.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL provide dashboard accessible from Banking_App main menu
2. THE dashboard SHALL display Financial_Health_Score calculated from budget adherence, savings rate, and overflow frequency
3. THE dashboard SHALL show current balance for all five funds with visual progress bars
4. THE dashboard SHALL display daily food spending status with remaining budget
5. THE dashboard SHALL show weekly savings accumulation progress with milestone indicators
6. THE dashboard SHALL provide spending analysis section showing top 5 spending categories with percentages
7. THE dashboard SHALL include Latte_Factor analysis showing recurring small expenses with potential savings calculation
8. THE dashboard SHALL display savings growth chart showing Future fund balance over time with projected growth curve
9. WHEN user taps on any metric, THE dashboard SHALL navigate to detailed view with transaction breakdown
10. THE dashboard SHALL refresh data automatically when new transactions are received from Transaction_Stream

### Requirement 11: Weekly Reward System

**User Story:** Là người dùng, tôi muốn nhận điểm thưởng khi tiết kiệm được tiền trong tuần, để có động lực duy trì kỷ luật tài chính.

#### Acceptance Criteria

1. WHEN a week ends on Sunday at 23:59:59, THE ZUNO_Module SHALL calculate total savings accumulated during the week
2. THE ZUNO_Module SHALL compare accumulated savings against three milestone thresholds: 50,000 VND, 100,000 VND, and 150,000 VND
3. IF accumulated savings reaches a milestone, THEN THE ZUNO_Module SHALL unlock reward chest for that tier
4. THE ZUNO_Module SHALL award points based on milestone tier: 100 points for 50k, 250 points for 100k, 500 points for 150k
5. WHEN reward chest is unlocked, THE ZUNO_Module SHALL send notification to user
6. THE ZUNO_Module SHALL display unlocked reward chest on dashboard with animation
7. WHEN user claims reward chest, THE ZUNO_Module SHALL add points to user total points balance
8. THE ZUNO_Module SHALL maintain weekly reward history showing achieved milestones and earned points
9. THE ZUNO_Module SHALL calculate and display points multiplier based on consecutive weeks achieving milestones

### Requirement 12: Smart Suggestions Engine

**User Story:** Là người dùng, tôi muốn nhận gợi ý thông minh về cách cải thiện tài chính, để học cách quản lý tiền tốt hơn theo thời gian.

#### Acceptance Criteria

1. WHEN Financial_Health_Score drops below 60, THE ZUNO_Module SHALL generate personalized improvement suggestions
2. THE ZUNO_Module SHALL analyze spending patterns over last 30 days to identify optimization opportunities
3. IF food spending variance exceeds 30% between days, THEN THE ZUNO_Module SHALL suggest creating consistent meal planning
4. IF Experience fund is consistently depleted before week ends, THEN THE ZUNO_Module SHALL suggest increasing allocation or reducing non-essential spending
5. IF Future fund receives less than 10% of monthly income, THEN THE ZUNO_Module SHALL suggest increasing savings allocation
6. THE ZUNO_Module SHALL provide actionable suggestions with estimated impact on Financial_Health_Score
7. WHEN user implements a suggestion, THE ZUNO_Module SHALL track implementation and measure actual impact after 14 days
8. THE ZUNO_Module SHALL display suggestion history with implemented vs dismissed ratio

### Requirement 13: Mobile Banking SDK Integration

**User Story:** Là mobile app developer của ngân hàng, tôi muốn tích hợp ZUNO_Module vào Banking_App dễ dàng, để giảm thời gian phát triển và đảm bảo tính ổn định.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL be packaged as SDK compatible with iOS and Android platforms
2. THE SDK SHALL provide initialization method accepting Authentication_Service configuration and Core_Banking_System endpoints
3. THE SDK SHALL expose public API for embedding ZUNO dashboard views into Banking_App
4. THE SDK SHALL handle all network communication with ZUNO backend services independently
5. THE SDK SHALL implement local caching for offline access to last known fund balances and recent transactions
6. WHEN network connection is unavailable, THE SDK SHALL display cached data with staleness indicator
7. THE SDK SHALL provide callback mechanism for Banking_App to receive notifications about significant events
8. THE SDK SHALL include error handling that prevents crashes in Banking_App if ZUNO services fail
9. THE SDK SHALL be versioned with semantic versioning and maintain backward compatibility for minor updates

### Requirement 14: User Onboarding Flow

**User Story:** Là người dùng mới, tôi muốn được hướng dẫn thiết lập ZUNO_Module dễ hiểu, để bắt đầu sử dụng tính năng behavioral finance nhanh chóng.

#### Acceptance Criteria

1. WHEN user accesses ZUNO_Module for first time, THE ZUNO_Module SHALL display onboarding welcome screen
2. THE onboarding flow SHALL collect residence type with options: dormitory or rental
3. THE onboarding flow SHALL collect monthly income amount
4. WHERE residence type is dormitory, THE onboarding flow SHALL ask if accommodation is paid per semester
5. THE onboarding flow SHALL ask if user receives food supplies from family
6. BASED ON collected information, THE ZUNO_Module SHALL recommend Fund_System allocation percentages with visual breakdown
7. THE onboarding flow SHALL allow user to adjust recommended percentages before confirmation
8. THE onboarding flow SHALL explain each fund type purpose with example use cases
9. THE onboarding flow SHALL request User_Consent for accessing transaction data from Core_Banking_System
10. WHEN onboarding is completed, THE ZUNO_Module SHALL create user profile and initialize Fund_System with current month funds
11. THE onboarding flow SHALL complete within 5 screens and take no more than 3 minutes

### Requirement 15: Privacy and Data Security

**User Story:** Là người dùng quan tâm về bảo mật, tôi muốn biết dữ liệu tài chính của mình được bảo vệ như thế nào, để yên tâm sử dụng ZUNO_Module.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL encrypt all transaction data at rest using AES-256 encryption
2. THE ZUNO_Module SHALL encrypt all data in transit using TLS 1.3
3. THE ZUNO_Module SHALL store behavioral analytics data separately from Core_Banking_System transaction data
4. THE ZUNO_Module SHALL never store full account numbers or sensitive banking credentials
5. THE ZUNO_Module SHALL use tokenized references to link behavioral data with banking accounts
6. WHEN user revokes consent, THE ZUNO_Module SHALL stop processing new transactions and mark existing data for deletion within 7 days
7. THE ZUNO_Module SHALL implement role-based access control for internal analytics tools
8. THE ZUNO_Module SHALL log all data access events for audit purposes
9. THE ZUNO_Module SHALL comply with banking data protection regulations applicable in deployment region
10. THE ZUNO_Module SHALL provide user-accessible privacy dashboard showing what data is collected and how it is used

### Requirement 16: Performance and Scalability

**User Story:** Là system architect, tôi muốn ZUNO_Module có khả năng mở rộng để phục vụ hàng triệu người dùng, để đảm bảo hệ thống ổn định khi ngân hàng triển khai rộng rãi.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL process incoming transactions from Transaction_Stream with latency not exceeding 500 milliseconds at 95th percentile
2. THE ZUNO_Module SHALL support concurrent access from at least 100,000 active users
3. THE ZUNO_Module SHALL scale horizontally by adding compute instances without code changes
4. THE ZUNO_Module SHALL implement connection pooling for database connections with maximum pool size of 100 connections per instance
5. THE ZUNO_Module SHALL use caching layer (Redis) for frequently accessed data with TTL of 300 seconds
6. WHEN cache is unavailable, THE ZUNO_Module SHALL fall back to database queries with degraded performance
7. THE ZUNO_Module SHALL implement rate limiting of 100 requests per minute per user to prevent abuse
8. THE ZUNO_Module SHALL implement circuit breaker pattern for external service calls with failure threshold of 50% over 30-second window
9. THE ZUNO_Module SHALL monitor system health metrics and send alerts when error rate exceeds 1%

### Requirement 17: MVP Demo Configuration

**User Story:** Là presenter tại fintech competition, tôi muốn demo MVP của ZUNO_Module hoạt động mượt mà với mock data, để thuyết phục ban giám khảo về giá trị sản phẩm.

#### Acceptance Criteria

1. THE MVP demo SHALL use Mock_Core_Banking database pre-populated with realistic transaction data
2. THE Mock_Core_Banking SHALL simulate Transaction_Stream by pushing transactions at realistic intervals
3. THE MVP demo SHALL include at least 3 user personas: student in dorm, young professional renting, and freelancer
4. THE MVP demo SHALL demonstrate all three overflow levels with prepared scenarios
5. THE MVP demo SHALL show Pre_Spending_Alert triggering before mock transaction execution
6. THE MVP demo SHALL display complete dashboard with realistic spending patterns and savings growth
7. THE MVP demo SHALL include e-commerce Latte_Factor scenario showing recurring coffee shop purchases
8. THE MVP demo SHALL demonstrate Deep_Link navigation to mock savings product page
9. THE demo SHALL run entirely on AWS infrastructure using Cognito, Bedrock, and RDS PostgreSQL
10. THE demo SHALL be accessible via web browser without requiring native mobile app installation

### Requirement 18: Transaction Rollback and Correction

**User Story:** Là người dùng, tôi muốn có khả năng điều chỉnh hoặc xóa giao dịch bị phân loại sai, để đảm bảo dữ liệu ngân sách chính xác.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL allow user to edit transaction category within 24 hours of transaction
2. WHEN user changes transaction category, THE ZUNO_Module SHALL recalculate affected fund balances
3. THE ZUNO_Module SHALL adjust Overflow_Engine state if category change affects overflow status
4. WHEN transaction is reclassified from Food to Experience, THE ZUNO_Module SHALL refund Food fund and deduct from Experience fund
5. THE ZUNO_Module SHALL maintain audit log of all transaction corrections with timestamp and reason
6. THE ZUNO_Module SHALL allow user to delete erroneous transactions with confirmation prompt
7. WHEN transaction is deleted, THE ZUNO_Module SHALL restore fund balance as if transaction never occurred
8. IF transaction deletion causes overflow event to become invalid, THEN THE ZUNO_Module SHALL cancel overflow event and restore borrowed funds
9. THE ZUNO_Module SHALL update Smart_Categorizer training data when user corrects categorization
10. THE ZUNO_Module SHALL display corrected transaction with indicator showing it was manually adjusted

### Requirement 19: Multi-Currency Support

**User Story:** Là người dùng có giao dịch nước ngoài, tôi muốn ZUNO_Module xử lý giao dịch ngoại tệ đúng cách, để ngân sách phản ánh chính xác các chi tiêu bằng ngoại tệ.

#### Acceptance Criteria

1. WHEN transaction is in foreign currency, THE ZUNO_Module SHALL convert amount to VND using exchange rate from Core_Banking_System
2. THE ZUNO_Module SHALL store both original currency amount and converted VND amount
3. THE ZUNO_Module SHALL display converted amount with currency symbol and exchange rate used
4. THE ZUNO_Module SHALL deduct converted VND amount from appropriate fund
5. WHERE user travels abroad, THE ZUNO_Module SHALL detect foreign transactions and group them in travel spending category
6. THE ZUNO_Module SHALL support at least 10 major currencies: USD, EUR, JPY, GBP, CNY, THB, SGD, KRW, AUD, CAD
7. WHEN exchange rate changes significantly, THE ZUNO_Module SHALL not retroactively adjust historical transactions

### Requirement 20: Business Intelligence and Reporting

**User Story:** Là bank product manager, tôi muốn truy cập aggregated behavioral insights từ ZUNO_Module, để hiểu xu hướng chi tiêu của khách hàng và phát triển sản phẩm phù hợp.

#### Acceptance Criteria

1. THE ZUNO_Module SHALL provide admin dashboard for bank staff with aggregated anonymized data
2. THE admin dashboard SHALL display total active users, average Financial_Health_Score, and Savings_Conversion_Rate
3. THE admin dashboard SHALL show top spending categories across all users with percentages
4. THE admin dashboard SHALL provide cohort analysis comparing student vs young professional segments
5. THE admin dashboard SHALL display overflow frequency heatmap showing days and times with highest overflow rates
6. THE admin dashboard SHALL show CASA growth attributed to ZUNO_Module savings feature
7. THE admin dashboard SHALL provide export functionality for generating monthly reports in CSV format
8. THE admin dashboard SHALL implement data anonymization ensuring no individual user can be identified
9. THE admin dashboard SHALL require separate admin authentication with elevated privileges
10. THE admin dashboard SHALL log all data access events for compliance auditing
