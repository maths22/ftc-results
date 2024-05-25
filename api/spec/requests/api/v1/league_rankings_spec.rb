require 'swagger_helper'

RSpec.describe 'api/v1/league_rankings', type: :request do

  path '/api/v1/{season}/rankings/league' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'

    get('list all league rankings') do
      tags 'Leagues'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/ranking' }

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

  path '/api/v1/{season}/rankings/league/{slug}' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string, description: 'slug'

    get('list league rankings for one league') do
      tags 'Leagues'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { 'CHI' }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/ranking' }

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
