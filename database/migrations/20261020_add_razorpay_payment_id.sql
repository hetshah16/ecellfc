ALTER TABLE recharge_log
  ADD COLUMN razorpay_payment_id VARCHAR(64) NULL,
  ADD UNIQUE KEY uq_recharge_log_razorpay_payment_id (razorpay_payment_id);