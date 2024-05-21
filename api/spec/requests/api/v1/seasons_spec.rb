require 'swagger_helper'

RSpec.describe 'api/v1/seasons', type: :request do

  path '/api/v1/seasons' do
    get('list seasons') do
      tags 'Seasons'
      response 200, 'successful' do
        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/season' }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test!
      end
    end
  end
end
