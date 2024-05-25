require 'swagger_helper'

RSpec.describe 'api/v1/teams', type: :request do
  path '/api/v1/teams' do
    parameter name: 'numbers[]', in: :query, schema: {
      type: :array,
      items: { type: :number },
    }, required: true

    get('list teams') do
      tags 'Teams'
      response(200, 'successful') do
        let(:'numbers[]') { [3216, 5037] }

        produces 'application/json'
        schema type: :array, items: { '$ref' => '#/components/schemas/team' }

        after do |example|
          example.metadata[:response][:content] = {
            'application/json' => {
              example: JSON.parse(response.body, symbolize_names: true)
            }
          }
        end
        run_test! do |response|
          data = JSON.parse(response.body)
          expect(data.length).to eq(2)
        end
      end
    end
  end

  path '/api/v1/teams/{number}' do
    parameter name: 'number', in: :path, type: :number

    get('show team') do
      tags 'Teams'
      response(200, 'successful') do
        let(:number) { 3216 }

        produces 'application/json'
        schema '$ref' => '#/components/schemas/team'

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

  path '/api/v1/teams/{number}/details' do
    parameter name: 'number', in: :path, type: :number

    get('show team details') do
      tags 'Teams'
      response(200, 'successful') do
        let(:number) { 3216 }

        produces 'application/json'
        schema type: :object,
               properties: {
                 team: { '$ref' => '#/components/schemas/team' },
                 seasons: {
                   type: :array,
                   items: {
                     type: :object,
                     properties: {
                       season: { type: :string },
                       record: { '$ref' => '#/components/schemas/winRecord' },
                       league: { type: :string },
                       events: {
                         type: :array,
                         items: {
                           type: :object,
                           properties: {
                             data: { '$ref' => '#/components/schemas/event' },
                             ranking: { '$ref' => '#/components/schemas/ranking' },
                             matches: {
                               type: :array,
                               items: { '$ref' => '#/components/schemas/match' }
                             }
                           },
                           required: %i[data matches]
                         }
                       }
                     },
                     required: %i[season record events]
                   }
                 }
               },
               required: %i[team seasons]

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
