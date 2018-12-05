class AccessMailer < ApplicationMailer
  def request_email
    @request = params[:request]
    admin_emails = User.where(role: 'admin').pluck(:email)
    mail(to: admin_emails, reply_to: @request.user.email, subject: 'FTC Results Access Request')
  end

  def approved_email
    @request = params[:request]
    mail(to: @request.user.email, subject: 'FTC Results Access Approved')
  end
end
