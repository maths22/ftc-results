require 'swagger_helper'

RSpec.describe 'api/v1/leagues', type: :request do
  path '/api/v1/{season}/leagues' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'

    get('list leagues') do
      tags 'Leagues'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/league' }

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

  path '/api/v1/{season}/leagues/{slug}' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string

    get('show league') do
      tags 'Leagues'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_LEAGUE }

        produces 'application/json'
        schema '$ref' => '#/components/schemas/league'

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
