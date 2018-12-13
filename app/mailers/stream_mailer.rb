class StreamMailer < ApplicationMailer
  def created_email
    @eca = params[:assignment]
    mail(to: @eca.user.email, subject: 'FTC Stream Info for ' + @eca.event.name)
  end

  def token_email
    @eca = params[:assignment]
    @stream_key = params[:stream_key]
    # owner_emails = @eca.event.owners.pluck(:email)
    # owner_emails.push(@eca.user.email).uniq
    mail(to: @eca.user.email, subject: 'FTC Stream Key for ' + @eca.event.name)
  end
end
