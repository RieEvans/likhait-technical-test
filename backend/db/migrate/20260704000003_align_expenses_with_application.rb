class AlignExpensesWithApplication < ActiveRecord::Migration[7.2]
  def change
    unless column_exists?(:expenses, :date)
      add_column :expenses, :date, :date, null: true
    end

    if column_exists?(:expenses, :created_at) && column_exists?(:expenses, :date)
      reversible do |dir|
        dir.up do
          execute <<~SQL.squish
            UPDATE expenses
            SET date = DATE(created_at)
            WHERE date IS NULL
          SQL
        end
      end

      change_column_null :expenses, :date, false
    end

    remove_column :expenses, :payer_name, :string if column_exists?(:expenses, :payer_name)
  end
end
