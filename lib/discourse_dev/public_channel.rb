# frozen_string_literal: true

require "discourse_dev/record"
require "faker"

module DiscourseDev
  class PublicChannel < Record
    def initialize
      super(::ChatChannel, 5)
    end

    def data
      chatable = Category.random

      {
        chatable: chatable,
        description: Faker::Lorem.paragraph,
        user_count: 1,
        name: Faker::Company.name,
        created_at: Faker::Time.between(from: DiscourseDev.config.start_date, to: DateTime.now),
      }
    end

    def create!
      super do |channel|
        Faker::Number
          .between(from: 5, to: 10)
          .times do
            if Faker::Boolean.boolean(true_ratio: 0.5)
              admin_username =
                begin
                  DiscourseDev::Config.new.config[:admin][:username]
                rescue StandardError
                  nil
                end
              admin_user = ::User.find_by(username: admin_username) if admin_username
            end

            ::UserChatChannelMembership.find_or_create_by!(
              user: admin_user || User.new.create!,
              chat_channel: channel,
              following: true,
            )
          end
      end
    end
  end
end
