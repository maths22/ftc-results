require 'swagger_helper'

RSpec.describe 'api/v1/matches', type: :request do
  path '/api/v1/{season}/events/{slug}/matches/{name}' do
    parameter name: 'season', in: :path, type: :string, description: 'Full season year'
    parameter name: 'slug', in: :path, type: :string
    parameter name: 'name', in: :path, type: :string, description: 'Match name (e.g. Q-1)'

    get('show match score details') do
      tags 'Matches'
      response(200, 'successful') do
        let(:season) { SAMPLE_SEASON }
        let(:slug) { SAMPLE_EVENT }
        let(:name) { 'Q-1' }

        produces 'application/json'
        schema oneOf: [
          { '$ref' => '#/components/schemas/matchDetails' },
          { '$ref' => '#/components/schemas/remoteMatchDetails' }
        ]

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
